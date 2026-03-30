import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EtapaServico, calcularCustoEtapa, calcularPrecoFinal, formatBRL } from "@/lib/orcamento";

export async function gerarPropostaPDF(
  etapas: EtapaServico[],
  custoHoraTotal: number,
  markup: number,
  impostos: number,
  nomeCliente: string
) {
  const doc = new jsPDF();
  const ativas = etapas.filter(e => e.ativa);
  const custoExecucao = ativas.reduce((s, e) => s + calcularCustoEtapa(e, custoHoraTotal), 0);
  const { precoVenda } = calcularPrecoFinal(custoExecucao, markup, impostos);

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
    doc.addImage(logoImg, "PNG", 15, 10, 25, 25);
  }
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PROPOSTA DE SERVIÇO", 50, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("HBS Engenharia", 50, 32);

  // Client info
  doc.setDrawColor(40, 180, 120);
  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);

  doc.setFontSize(11);
  doc.text(`Cliente: ${nomeCliente || 'A definir'}`, 15, 52);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, 58);

  // Services table
  const tableBody = ativas.map(e => [
    e.nome,
    `${e.horasEstimadas + e.visitasEstimadas * 8}h`,
  ]);

  autoTable(doc, {
    startY: 65,
    head: [["Serviço", "Horas Previstas"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [20, 90, 70], textColor: 255 },
    styles: { fontSize: 10 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // Total
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`VALOR TOTAL: ${formatBRL(precoVenda)}`, 15, finalY);

  // Payment
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Condições de Pagamento:", 15, finalY + 12);
  doc.text("• 50% na assinatura do contrato (PIX)", 20, finalY + 19);
  doc.text("• 50% na conclusão dos serviços (PIX)", 20, finalY + 25);

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Proposta válida por 30 dias. | HBS Engenharia", 15, 280);

  doc.save(`proposta-hbs-${Date.now()}.pdf`);
}
