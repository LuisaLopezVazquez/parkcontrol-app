import express from "express";
import cors from "cors";
import type { DbParkingSpot } from "./types";
import { readDb, writeDb } from "./store";
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

app.listen(PORT, "127.0.0.1", () => {
  console.log(`[parkcontrol-api] http://127.0.0.1:${PORT}`);
});
