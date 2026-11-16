import { Suspense } from "react";
import Loading from "../loading";
import EstadoClient from "./client";

export default function EstadoPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EstadoClient />
    </Suspense>
  );
}
