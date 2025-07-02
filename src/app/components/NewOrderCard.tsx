export default function NewOrderCard() {
  return (
    <div className="flex w-80 flex-col gap-1 rounded-xl bg-[#EEAA4B] px-5 py-3 text-black">
      <small>#123456</small>
      <div className="flex items-center justify-between">
        <b className="text-lg">Mariano</b>
        <p className="font-medium">Hace 5 minutos</p>
      </div>
      <small>4 productos</small>
    </div>
  );
}
