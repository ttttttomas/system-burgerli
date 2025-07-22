"use client";
import {useState} from "react";
import {Eye, EyeOff} from "lucide-react";
import {useRouter} from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({user, password});
    router.push("/");
  };

  return (
    <main className="flex h-screen max-h-screen flex-col items-center justify-start gap-52">
      <header className="w-full bg-[#2D2D2D] px-6 py-3">
        <img alt="Burgerli" className="h-16 w-auto" src="/logo.png" />
      </header>
      <section className="flex items-center justify-center rounded-xl">
        <div className="flex h-96 rounded-xl shadow-lg">
          {/* Izquierda - Imagen + texto */}
          <div className="relative flex w-1/2 flex-col items-center justify-center rounded-l-xl bg-black/70 p-8 text-white backdrop-blur-sm">
            <img
              alt="burger"
              className="absolute inset-0 -z-10 h-full w-full rounded-xl object-cover opacity-40"
              src="/login-photo.png" // reemplazá por tu imagen
            />
            <h2 className="text-center text-2xl font-bold">
              ¡Bienvenido/a al Sistema de Gestión de Burgerli!
            </h2>
          </div>

          {/* Derecha - Formulario */}
          <div className="relative w-1/2 rounded-r-xl bg-[#493D2E] p-8">
            <img
              alt="Logo"
              className="absolute -top-12 left-1/2 z-40 h-24 w-24 -translate-x-1/2 rounded-full"
              src="/logo.png" // logo circular en la parte superior
            />

            <form className="mt-16 space-y-6 text-white" onSubmit={handleSubmit}>
              <div>
                <p className="mb-1 block text-sm font-semibold">Usuario</p>
                <input
                  className="w-full border-b border-white bg-transparent placeholder-white focus:outline-none"
                  type="text"
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>

              <div className="relative">
                <p className="mb-1 block text-sm font-semibold">Contraseña</p>
                <input
                  className="w-full border-b border-white bg-transparent pr-10 placeholder-white focus:outline-none"
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute top-7 right-0 text-white"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                className="w-full cursor-pointer rounded-md bg-[#EEAA4B] py-2 font-semibold text-black hover:bg-[#e39632]"
                type="submit"
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
