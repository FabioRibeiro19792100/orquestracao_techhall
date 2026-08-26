import type {Metadata} from "next";
import "./globals.css";
import "./screens.css";
import "./linear.css";
import "./layers.css";
import "./controls.css";
import "./links.css";
import "./integrated.css";
import "./play.css";
import "./evidence.css";
export const metadata:Metadata={title:"Orquestra · Laboratório de decisões agentic",description:"Simulador executivo para compreender como decisões gerenciais alteram operações com agentes de IA.",openGraph:{title:"Orquestra",description:"Decisões gerenciais. Agentes em movimento. Resultados visíveis.",images:["/og.png"]},twitter:{card:"summary_large_image",title:"Orquestra",description:"Decisões gerenciais. Agentes em movimento. Resultados visíveis.",images:["/og.png"]}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
