export default function OrderReadyCard() {
  return (
    <div className="flex w-90 flex-col gap-3 rounded-xl bg-[#493D2E] px-5 py-3 text-white shadow-lg shadow-black/50">
      <small>#123456</small>
      <div className="flex items-center justify-between">
        <b className="text-lg">Mariano</b>
        <p>Hace 5 minutos</p>
      </div>
      <small>4 productos</small>
    </div>
  );
}
