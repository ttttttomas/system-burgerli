export default function PopUpNewOrder() {
  return (
    <div>
      <div>
        <img alt="Burgerli" src="/logo.png" />
      </div>
      <div>
        <ul className="flex flex-col gap-1">
          <li className="flex gap-5">
            <b>1x</b>
            <ul>
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
            <small>$11.200</small>
          </li>
          <hr className="border-[1px] border-black" />
          <li className="flex gap-5">
            <b>1x</b>
            <ul>
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
            <small>$11.200</small>
          </li>
          <hr className="border-[1px] border-black" />
        </ul>
      </div>
    </div>
  );
}
