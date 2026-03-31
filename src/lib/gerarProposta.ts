import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  EtapaServico, calcularCustoEtapa, calcularTotalProtocolos, calcularPrecoFinal,
  formatBRL, type ProtocolosSelecionados, type CustosProtocolo,
} from "@/lib/orcamento";

export async function gerarPropostaPDF(
  etapas: EtapaServico[],
  custoHora: number,
  protocolos: ProtocolosSelecionados,
  custosProtocolo: CustosProtocolo,
  lucro: number,
  impostos: number,
  comissao: number,
  nomeCliente: string,
  localObra?: string,
  prazo?: number
) {
  const doc = new jsPDF();
  const ativas = etapas.filter(e => e.ativa);
  const custoTecnico = ativas.reduce((s, e) => s + calcularCustoEtapa(e, custoHora), 0);
  const custoProtocolos = calcularTotalProtocolos(protocolos, custosProtocolo);
  const resultado = calcularPrecoFinal(custoTecnico, custoProtocolos, lucro, impostos, comissao);

  // Logo
  let logoImg: string | null = null;
  try {
    const resp = await fetch("/logo-hbs.png");
    const blob = await resp.blob();
    logoImg = await new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {}

  if (logoImg) doc.addImage(logoImg, "PNG", 15, 8, 30, 30);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PROPOSTA DE SERVIÇO", 55, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("HBS Soluções em Engenharia", 55, 29);

  doc.setDrawColor(40, 180, 120);
  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);

  let y = 52;
  doc.setFontSize(11);
  doc.text(`Cliente: ${nomeCliente || 'A definir'}`, 15, y);
  y += 6;
  if (localObra) { doc.text(`Local: ${localObra}`, 15, y); y += 6; }
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, y);
  doc.text(`Validade: 30 dias`, 120, y);
  if (prazo) { y += 6; doc.text(`Prazo estimado: ${prazo} dias`, 15, y); }
  y += 10;

  // Módulos de Serviço
  if (ativas.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Módulos de Serviço Inclusos:", 15, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Módulo", "Escopo Sugerido", "Total Dedicação"]],
      body: ativas.map(e => [
        e.nome, 
        e.descricao, 
        `${(e.visitas * 8) + e.horas}h`
      ]),
      theme: "grid",
      headStyles: { fillColor: [40, 60, 50], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 30, halign: 'center' }
      },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Protocolos inclusos
  const protoItems: string[] = [];
  if (protocolos.art) protoItems.push(`ART/RRT (${formatBRL(custosProtocolo.art)})`);
  if (protocolos.pasta) protoItems.push(`Pasta Prefeitura (${formatBRL(custosProtocolo.pasta)})`);
  if (protocolos.assinatura) protoItems.push(`Assinatura Técnica (${formatBRL(custosProtocolo.assinatura)})`);

  if (protoItems.length > 0) {
    y += 2;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Taxas e Protocolos Inclusos:", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    protoItems.forEach(item => {
      doc.text(`• ${item}`, 20, y);
      y += 5;
    });
    y += 3;
  }

  // Total
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`VALOR TOTAL: ${formatBRL(resultado.precoVenda)}`, 15, y + 5);

  // Pagamento
  const payY = y + 17;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Condições de Pagamento:", 15, payY);
  doc.text("• 50% na assinatura do contrato (PIX)", 20, payY + 7);
  doc.text("• 50% na conclusão dos serviços (PIX)", 20, payY + 13);

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Proposta válida por 30 dias. | HBS Soluções em Engenharia", 15, 280);

  doc.save(`proposta-hbs-${Date.now()}.pdf`);
}
