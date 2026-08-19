import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const cockpitCss = `.seed-demo{width:100%;border:0;background:var(--navy);color:#fff;padding:12px;margin-top:20px;font-size:12px}.simultaneous{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(360px,.75fr);gap:14px;padding:18px 0}.sim-projection,.sim-person{background:#fff;border:1px solid var(--line);min-width:0}.sim-projection>header,.sim-person>header{min-height:62px;padding:13px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:12px}.sim-projection header small,.sim-person header small{font-size:9px;letter-spacing:.11em;color:#896434;font-weight:800}.sim-projection header b{font-size:12px}.sim-person select{max-width:240px;padding:8px;border:1px solid var(--line);background:#fff}.scaled-shared{padding:0 20px;max-height:690px;overflow:auto}.simultaneous .waiting,.simultaneous .shared{padding-top:24px}.simultaneous .shared h1,.simultaneous .waiting h1{font-size:31px}.simultaneous .metrics{grid-template-columns:repeat(5,1fr)}.simultaneous .metrics article{padding:11px}.simultaneous .metrics b{font-size:20px}.sim-person .participant-card{border:0;margin:0;min-height:625px}.business-rule{background:#eee5d5;border-left:4px solid var(--gold);padding:16px;margin:18px 0}.business-rule small,.business-rule b{display:block}.business-rule small,.agent-workflow>small{font-size:9px;letter-spacing:.11em;color:#896434;font-weight:800}.business-rule b{font:18px/1.4 Georgia;margin-top:7px}.agent-workflow{border:1px solid var(--line);padding:17px}.agent-workflow ol{padding-left:22px}.agent-workflow li{padding:8px 0}.agent-workflow li b,.agent-workflow li span{display:block}.agent-workflow li b{font-size:13px}.agent-workflow li span{font-size:12px;line-height:1.4;color:var(--muted);margin-top:3px}@media(max-width:1100px){.simultaneous{grid-template-columns:1fr}.simultaneous .metrics{grid-template-columns:repeat(3,1fr)}}@media(max-width:600px){.simultaneous .metrics{grid-template-columns:1fr}.sim-projection>header,.sim-person>header{align-items:flex-start;flex-direction:column}}`;

const nerveCss = `.nerve{padding:24px 0}.nerve>header{display:flex;justify-content:space-between;gap:20px;align-items:end}.nerve>header p{font-size:10px;font-weight:800;letter-spacing:.13em;color:#896434}.nerve>header h1{font:40px Georgia;margin:8px 0}.nerve>header span{font:16px Georgia;color:var(--muted)}.play-controls{display:flex;gap:8px}.play-controls button{border:1px solid var(--line);background:#fff;padding:13px 18px}.play-controls .play{background:var(--green);color:#fff;border-color:var(--green)}.play-controls .pause{background:var(--red);color:#fff;border-color:var(--red)}.live-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:22px 0}.live-metrics article{background:#fff;border:1px solid var(--line);padding:14px}.live-metrics span,.live-metrics b{display:block}.live-metrics span{font-size:10px;color:var(--muted)}.live-metrics b{font:24px Georgia;margin-top:7px}.runtime{display:grid;grid-template-columns:1fr 24px 1.2fr 24px 2.2fr 24px 1fr;align-items:center;background:#fff;border:1px solid var(--line);padding:18px}.runtime>i{text-align:center;font-style:normal;color:var(--gold)}.runtime-start,.runtime-orchestrator,.runtime-output{padding:16px;border:1px solid var(--line);min-height:145px}.runtime-orchestrator{background:var(--navy);color:#fff}.runtime small,.runtime b,.runtime span{display:block}.runtime small{font-size:8px;letter-spacing:.1em;color:#9a7545}.runtime b{font:17px Georgia;margin:15px 0}.runtime span{font-size:11px;color:var(--muted)}.runtime-orchestrator span{color:#b7c3cc}.runtime-agents{display:grid;grid-template-columns:1fr 1fr;gap:6px}.runtime-agents button{border:1px solid var(--line);background:#fff;padding:10px;text-align:left}.runtime-agents button.working{border-color:var(--gold);background:#fff6e7}.runtime-agents button.done{background:#edf4ef;border-color:#94b8a4}.runtime-agents button>span{font-size:8px;text-transform:uppercase;color:var(--green)}.runtime-agents button>b{font:14px Arial;margin:5px 0}.runtime-agents button>small{font-size:9px;line-height:1.3;color:var(--muted);letter-spacing:0}.event-stream{background:var(--navy);color:#fff;margin-top:12px;padding:17px}.event-stream>header{display:flex;justify-content:space-between;border-bottom:1px solid #3a4a57;padding-bottom:11px}.event-stream>header span{font-size:10px;color:#9fb0bd}.event-stream>div{display:grid;grid-template-columns:70px 12px 1fr;gap:10px;align-items:center;padding:8px 0}.event-stream time{font:10px monospace;color:#93a5b2}.event-stream i{width:7px;height:7px;border-radius:50%;background:#5d7483}.event-stream i.pulse{background:#58ca8b}.event-stream p{font-size:12px;margin:0}.nerve>footer{background:#eae5da;padding:15px;margin-top:12px}.nerve>footer b,.nerve>footer span{display:block}.nerve>footer span{font-size:12px;color:var(--muted);margin-top:4px}.parameter-editor{background:#e9eef0;padding:18px;margin:18px 0}.parameter-editor>small{font-size:9px;letter-spacing:.1em;color:#896434;font-weight:800}.parameter-editor label{display:grid;grid-template-columns:1fr 110px;gap:8px;border-top:1px solid #ccd3d6;padding:11px 0;font-size:12px}.parameter-editor select{grid-column:2;padding:7px}.parameter-editor input{grid-column:1/-1;width:100%}.parameter-editor button{border:0;background:var(--green);color:#fff;padding:11px}.parameter-editor p{font-size:11px;line-height:1.4;color:var(--muted)}@media(max-width:1100px){.runtime{grid-template-columns:1fr}.runtime>i{transform:rotate(90deg)}}@media(max-width:600px){.nerve>header{display:block}.play-controls{margin-top:15px}.live-metrics{grid-template-columns:1fr 1fr}}`;

const roleCss = `.role-facts{display:grid;gap:7px;margin:20px 0}.role-facts article{border:1px solid var(--line);padding:12px}.role-facts small,.role-facts b{display:block}.role-facts small{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#896434}.role-facts b{font:17px/1.35 Georgia;margin-top:5px}.role-authority{background:#edf1ef;padding:15px;margin-top:20px}.role-authority b,.role-authority span{display:block}.role-authority b{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--green);margin-top:11px}.role-authority b:first-child{margin-top:0}.role-authority span{font-size:13px;line-height:1.4;margin-top:4px}`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orquestra Lab — Simulador de Orquestração de IA",
  description: "Laboratório multiplayer para experimentar decisões, papéis e consequências em sistemas de IA.",
  metadataBase: new URL("https://orquestra-lab.pages.dev"),
  openGraph: {
    title: "Orquestra Lab",
    description: "Decisão, arquitetura e consequência.",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orquestra Lab",
    description: "Decisão, arquitetura e consequência.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head><style dangerouslySetInnerHTML={{ __html: cockpitCss + nerveCss + roleCss }} /></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
