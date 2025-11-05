// api/consent.ts
import { put } from '@vercel/blob';

export const config = { runtime: 'edge' };

type Payload = {
  nombre: string;
  rutEmpresa: string;
  email: string;
  aceptaTerminos?: boolean;
};

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Normaliza RUT (empresa) y valida DV
function normalizarRut(rut: string) {
  return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
}
function dvRut(num: string) {
  let suma = 0, mul = 2;
  for (let i = num.length - 1; i >= 0; i--) {
    suma += parseInt(num[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (suma % 11);
  if (res === 11) return '0';
  if (res === 10) return 'K';
  return String(res);
}
function validarRut(rut: string) {
  const r = normalizarRut(rut);
  if (r.length < 2) return false;
  const cuerpo = r.slice(0, -1);
  const dv = r.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  return dvRut(cuerpo) === dv;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0';
    const ua = req.headers.get('user-agent') || '';

    const body = (await req.json()) as Partial<Payload>;
    const nombre = (body.nombre || '').trim();
    const rutEmpresa = (body.rutEmpresa || '').trim();
    const email = (body.email || '').trim();
    const acepta = !!body.aceptaTerminos;

    if (!acepta) {
      return new Response(JSON.stringify({ ok: false, error: 'Debe aceptar términos.' }), { status: 400 });
    }
    if (!nombre || !rutEmpresa || !email) {
      return new Response(JSON.stringify({ ok: false, error: 'Faltan campos.' }), { status: 400 });
    }
    if (!validarEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Email inválido.' }), { status: 400 });
    }
    if (!validarRut(rutEmpresa)) {
      return new Response(JSON.stringify({ ok: false, error: 'RUT inválido.' }), { status: 400 });
    }

    const now = new Date().toISOString();
    const filename = `submissions/${Date.now()}.json`;

    const record = {
      nombre,
      rutEmpresa: normalizarRut(rutEmpresa),
      email,
      aceptaTerminos: true,
      acceptedAt: now,
      ip,
      userAgent: ua,
    };

    const result = await put(filename, JSON.stringify(record), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: true,
    });

    return new Response(JSON.stringify({ ok: true, id: result.pathname }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Error de servidor.' }), { status: 500 });
  }
}
