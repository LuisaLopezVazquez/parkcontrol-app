import express from "express";
import cors from "cors";
import type { DbParkingSpot, DbVehicle } from "./types";
import { readDb, writeDb } from "./store";
import { isPlateTaken, nextVehicleId, normalizePlate } from "./vehicles";
import {
  createSession,
  getBearerToken,
  requireAuth,
  revokeSession,
  toPublicUser,
  type AuthedRequest,
} from "./auth";

const PORT = Number(process.env.PORT) || 3001;

function computeMetrics(db: Awaited<ReturnType<typeof readDb>>) {
  const spots = db.parkingSpots;
  const availableSpots = spots.filter((s) => s.status === "available").length;
  const occupiedSpots = spots.filter((s) => s.status === "occupied").length;
  return {
    totalSpots: spots.length,
    availableSpots,
    occupiedSpots,
    registeredVehicles: db.vehicles.length,
  };
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }
    const db = await readDb();
    const user = db.users.find((u) => u.email === email && u.password === password);
    if (!user) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }
    const accessToken = await createSession(user.id);
    res.json({
      user: toPublicUser(user),
      accessToken,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    await revokeSession(getBearerToken(req));
    res.status(204).send();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json((req as AuthedRequest).authUser);
});

app.get("/api/dashboard/metrics", requireAuth, async (_req, res) => {
  try {
    const db = await readDb();
    res.json(computeMetrics(db));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.get("/api/parking-spots", requireAuth, async (_req, res) => {
  try {
    const db = await readDb();
    res.json(db.parkingSpots);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.patch("/api/parking-spots/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as Partial<Pick<DbParkingSpot, "status" | "vehiclePlate" | "ownerName">>;

    const db = await readDb();
    const idx = db.parkingSpots.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Cajón no encontrado" });
      return;
    }

    const current = db.parkingSpots[idx];
    if (!current) {
      res.status(404).json({ error: "Cajón no encontrado" });
      return;
    }

    let next: DbParkingSpot = { ...current };

    if (body.status === "available") {
      next = {
        ...current,
        status: "available",
        vehiclePlate: undefined,
        ownerName: undefined,
      };
    } else if (body.status === "occupied") {
      next = {
        ...current,
        status: "occupied",
        vehiclePlate: body.vehiclePlate ?? current.vehiclePlate ?? "SIN-PLACA",
        ownerName: body.ownerName ?? current.ownerName ?? "Sin nombre",
      };
    } else {
      res.status(400).json({ error: "Use status: available | occupied" });
      return;
    }

    db.parkingSpots[idx] = next;
    await writeDb(db);
    res.json(next);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.get("/api/vehicles/recent", requireAuth, async (_req, res) => {
  try {
    const db = await readDb();
    res.json(db.vehicles);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.get("/api/vehicles", requireAuth, async (_req, res) => {
  try {
    const db = await readDb();
    const sorted = [...db.vehicles].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    res.json(sorted);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.get("/api/vehicles/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    const v = db.vehicles.find((x) => x.id === id);
    if (!v) {
      res.status(404).json({ error: "Vehículo no encontrado" });
      return;
    }
    res.json(v);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.post("/api/vehicles", requireAuth, async (req, res) => {
  try {
    const body = req.body as Partial<DbVehicle>;
    const plate = typeof body.plate === "string" ? normalizePlate(body.plate) : "";
    const brand = typeof body.brand === "string" ? body.brand.trim() : "";
    const model = typeof body.model === "string" ? body.model.trim() : "";
    const color = typeof body.color === "string" ? body.color.trim() : "";
    const ownerName = typeof body.ownerName === "string" ? body.ownerName.trim() : "";
    const unit = typeof body.unit === "string" ? body.unit.trim() : "";
    const registeredAt = typeof body.registeredAt === "string" ? body.registeredAt.trim() : "";
    const spotNumber =
      typeof body.spotNumber === "string" && body.spotNumber.trim() !== "" ? body.spotNumber.trim() : undefined;

    if (!plate || !brand || !model || !color || !ownerName || !unit || !registeredAt) {
      res.status(400).json({ error: "Faltan campos obligatorios" });
      return;
    }

    const db = await readDb();
    if (isPlateTaken(db.vehicles, plate)) {
      res.status(409).json({ error: "Ya existe un vehículo con esa placa" });
      return;
    }

    const id = nextVehicleId(db.vehicles);
    const created: DbVehicle = {
      id,
      plate,
      brand,
      model,
      color,
      ownerName,
      unit,
      registeredAt,
      spotNumber,
    };
    db.vehicles.push(created);
    await writeDb(db);
    res.status(201).json(created);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.patch("/api/vehicles/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as Partial<Omit<DbVehicle, "id">>;

    const db = await readDb();
    const idx = db.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Vehículo no encontrado" });
      return;
    }

    const current = db.vehicles[idx];
    if (!current) {
      res.status(404).json({ error: "Vehículo no encontrado" });
      return;
    }

    const nextPlate = body.plate !== undefined ? normalizePlate(String(body.plate)) : current.plate;
    if (body.plate !== undefined && isPlateTaken(db.vehicles, nextPlate, id)) {
      res.status(409).json({ error: "Ya existe un vehículo con esa placa" });
      return;
    }

    const updated: DbVehicle = {
      ...current,
      plate: body.plate !== undefined ? nextPlate : current.plate,
      brand: body.brand !== undefined ? String(body.brand).trim() : current.brand,
      model: body.model !== undefined ? String(body.model).trim() : current.model,
      color: body.color !== undefined ? String(body.color).trim() : current.color,
      ownerName: body.ownerName !== undefined ? String(body.ownerName).trim() : current.ownerName,
      unit: body.unit !== undefined ? String(body.unit).trim() : current.unit,
      registeredAt:
        body.registeredAt !== undefined ? String(body.registeredAt).trim() : current.registeredAt,
      spotNumber:
        body.spotNumber === undefined
          ? current.spotNumber
          : String(body.spotNumber).trim() === ""
            ? undefined
            : String(body.spotNumber).trim(),
    };

    db.vehicles[idx] = updated;
    await writeDb(db);
    res.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.delete("/api/vehicles/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    const before = db.vehicles.length;
    db.vehicles = db.vehicles.filter((v) => v.id !== id);
    if (db.vehicles.length === before) {
      res.status(404).json({ error: "Vehículo no encontrado" });
      return;
    }
    await writeDb(db);
    res.status(204).send();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`[parkcontrol-api] http://127.0.0.1:${PORT}`);
});
