import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Borrar todas las cookies relacionadas con la sesión
    const allCookies = cookieStore.getAll();
    
    allCookies.forEach((cookie) => {
      // Borrar cookies de sesión (ajusta los nombres según tu backend)
      if (
        cookie.name.includes('session') || 
        cookie.name.includes('token') ||
        cookie.name.includes('Authorization') ||
        cookie.name.includes('user')
      ) {
        cookieStore.delete(cookie.name);
      }
    });

    // También intentar borrar cookies comunes
    const commonCookieNames = [
      'session',
      'token',
      'auth_token',
      'access_token',
      'user_session',
      'connect.sid',
      'PHPSESSID',
    ];

    commonCookieNames.forEach((name) => {
      try {
        cookieStore.set(name, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
        });
      } catch (e) {
        // Ignorar errores al borrar cookies que no existen
      }
    });

    console.log("✅ Cookies borradas en Next.js");

    return NextResponse.json({ 
      success: true, 
      message: "Logout exitoso" 
    });
  } catch (error) {
    console.error("❌ Error en logout:", error);
    return NextResponse.json(
      { success: false, message: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
