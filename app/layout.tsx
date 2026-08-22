import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"Orquestra · Laboratório de decisões agentic",description:"Simulador executivo para compreender como decisões gerenciais alteram operações com agentes de IA.",openGraph:{title:"Orquestra",description:"Decisões gerenciais. Agentes em movimento. Resultados visíveis.",images:["/og.png"]},twitter:{card:"summary_large_image",title:"Orquestra",description:"Decisões gerenciais. Agentes em movimento. Resultados visíveis.",images:["/og.png"]}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
