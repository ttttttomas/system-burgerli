export default function OrderCard() {
  return (
    <section className="container flex max-w-80 flex-col rounded-xl bg-[#FCEDCC] shadow-lg shadow-black/50">
      <div className="flex flex-col items-center rounded-t-xl bg-[#FD4E4E] px-5 py-1">
        <div className="flex w-full items-center justify-between">
          <small className="font-semibold">#123456</small>
          <small className="font-semibold">Hace 30 minutos</small>
        </div>
        <b className="block">Mariano</b>
      </div>
      <div className="flex flex-col items-start">
        <div className="flex gap-3 p-5">
          <p className="mt-3 text-xl font-bold">1x</p>
          <ul className="flex flex-col gap-1">
            <li className="font-bold">Hamburguesa triple queso</li>
            <li>
              <b>Extra:</b> Panceta
            </li>
            <li>
              <b>Sin:</b> Mostaza, ketchup
            </li>
            <li>
              <b>Papas:</b> Clasicas
            </li>
          </ul>
        </div>
        <div className="flex gap-3 p-5">
          <p className="text-xl font-bold">1x</p>
          <ul className="flex flex-col gap-1">
            <li className="font-bold">Hamburguesa triple queso</li>
            <li>
              <b>Papas:</b> Burgerli
            </li>
          </ul>
        </div>
        <div className="flex gap-3 p-5">
          <p className="text-xl font-bold">2x</p>
          <ul className="flex flex-col items-center gap-1">
            <li className="font-bold">Coca 500ml</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
