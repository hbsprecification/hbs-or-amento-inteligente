import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EtapaServico, calcularCustoEtapa, calcularPrecoFinal, formatBRL, GRUPOS } from "@/lib/orcamento";

export async function gerarPropostaPDF(
  etapas: EtapaServico[],
  custoHora: number,
  lucro: number,
  impostos: number,
  comissao: number,
  nomeCliente: string,
  localObra?: string,
  prazo?: number
) {
  const doc = new jsPDF();
  const ativas = etapas.filter(e => e.ativa);
  const custoExecucao = ativas.reduce((s, e) => s + calcularCustoEtapa(e, custoHora), 0);
  const resultado = calcularPrecoFinal(custoExecucao, lucro, impostos, comissao);

  // Load logo
  let logoImg: string | null = null;
  try {
    const resp = await fetch("/logo-hbs.png");
    const blob = await resp.blob();
    logoImg = await new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch { /* no logo */ }

  // Header
  if (logoImg) {
    doc.addImage(logoImg, "PNG", 15, 8, 30, 30);
  }
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PROPOSTA DE SERVIÇO", 55, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("HBS Soluções em Engenharia", 55, 29);

  doc.setDrawColor(40, 180, 120);
  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);

  let infoY = 52;
  doc.setFontSize(11);
  doc.text(`Cliente: ${nomeCliente || 'A definir'}`, 15, infoY);
  infoY += 6;
  if (localObra) {
    doc.text(`Local: ${localObra}`, 15, infoY);
    infoY += 6;
  }
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, infoY);
  if (prazo) {
    doc.text(`Prazo: ${prazo} dias`, 120, infoY);
  }
  doc.text(`Validade: 30 dias`, 120, infoY - 6);

  let currentY = infoY + 10;

  for (const grupo of GRUPOS) {
    const etapasGrupo = ativas.filter(e => e.grupo === grupo);
    if (etapasGrupo.length === 0) continue;

    const tableBody = etapasGrupo.map(e => [
      e.nome,
      `${e.visitas}`,
      `${e.horas + e.visitas * 8}h`,
    ]);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(grupo, 15, currentY);
    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      head: [["Serviço", "Visitas", "Horas Previstas"]],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [20, 50, 60], textColor: 255, fontSize: 9 },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Total
  const finalY = currentY + 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`VALOR TOTAL: ${formatBRL(resultado.precoVenda)}`, 15, finalY);

  if (resultado.comissao > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`(Inclui comissão de parceiro: ${formatBRL(resultado.comissao)})`, 15, finalY + 6);
    doc.setTextColor(0);
  }

  // Payment
  const payY = finalY + (resultado.comissao > 0 ? 14 : 10);
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
