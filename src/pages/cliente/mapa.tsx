import MapRJ from "@/components/map/MapRJ";

export default function MapaCliente() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapRJ
        stores={[
          {
            id: "1",
            nome: "Mercado Teste",
            latitude: -22.91,
            longitude: -43.56,
          },
          {
            id: "2",
            nome: "Padaria Central",
            latitude: -22.92,
            longitude: -43.55,
          },
        ]}
        isAdmin={false}
      />
    </div>
  );
}
