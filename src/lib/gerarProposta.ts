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
  objetivo?: string,
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
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ORÇAMENTO PARA REGULARIZAÇÃO DE IMÓVEL", 55, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("HBS Soluções em Engenharia", 55, 29);

  doc.setDrawColor(40, 180, 120);
  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);

  let y = 52;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Cliente:`, 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${nomeCliente || 'A definir'}`, 32, y);
  y += 6;
  
  if (objetivo) { 
    doc.setFont("helvetica", "bold");
    doc.text(`Objetivo do Projeto:`, 15, y); 
    doc.setFont("helvetica", "normal");
    doc.text(`${objetivo}`, 55, y); 
    y += 6; 
  }
  
  if (localObra) { 
    doc.setFont("helvetica", "bold");
    doc.text(`Endereço do Objeto:`, 15, y); 
    doc.setFont("helvetica", "normal");
    doc.text(`${localObra}`, 55, y); 
    y += 6; 
  }
  
  doc.setFont("helvetica", "bold");
  doc.text(`Data:`, 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${new Date().toLocaleDateString('pt-BR')}`, 27, y);
  
  doc.setFont("helvetica", "bold");
  doc.text(`Validade: 30 dias`, 120, y);
  
  if (prazo) { 
    y += 6; 
    doc.setFont("helvetica", "bold");
    doc.text(`Prazo estimado:`, 15, y); 
    doc.setFont("helvetica", "normal");
    doc.text(`${prazo} dias`, 48, y); 
  }
  y += 10;

  // Módulos de Serviço
  if (ativas.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Módulos de Serviço Inclusos:", 15, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Módulo Principal", "Escopo de Serviço"]],
      body: ativas.map(e => [
        e.grupo, 
        e.nome
      ]),
      theme: "grid",
      headStyles: { fillColor: [40, 60, 50], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 4, textColor: 60 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', textColor: 30 },
        1: { cellWidth: 'auto' }
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
    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Taxas e Protocolos Inclusos:", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    protoItems.forEach(item => {
      doc.text(`• ${item}`, 20, y);
      y += 5;
    });
    // Extra safety margin after protocols to avoid overlap
    y += 10;
  } else {
    y += 15;
  }

  // Bloco de Destaque - VALOR TOTAL
  doc.setFillColor(192, 90, 62); // Terracota HBS
  doc.rect(15, y, 180, 16, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`VALOR TOTAL DO INVESTIMENTO: ${formatBRL(resultado.precoVenda)}`, 20, y + 10.5);

  y += 24;

  // Frase de Validade
  doc.setTextColor(100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Proposta válida por 30 dias a partir da data de emissão.", 15, y);

  y += 12;

  // Condições de Pagamento
  doc.setTextColor(40);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Condições Gerais de Pagamento:", 15, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const p50 = formatBRL(resultado.precoVenda * 0.5);
  const p20 = formatBRL(resultado.precoVenda * 0.2);
  const p10 = formatBRL(resultado.precoVenda * 0.1);

  doc.text(`• 50% na vistoria / assinatura do contrato (${p50})`, 20, y);
  doc.text(`• 20% no protocolo de licença (${p20})`, 20, y + 6);
  doc.text(`• 20% na emissão do Habite-se (${p20})`, 20, y + 12);
  doc.text(`• 10% no protocolo do Cartório (${p10})`, 20, y + 18);

  y += 28;

  // Texto de Notas / Segurança
  doc.setTextColor(100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("* Não estão inclusos taxas de prefeitura, emolumentos de cartório e impostos, que são de responsabilidade do contratante.", 15, y);

  y += 35;

  // Assinatura Centralizada
  doc.setTextColor(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  // doc.text centered at X=105 (A4 width is 210)
  doc.text("__________________________________________", 105, y, { align: "center" });
  y += 6;
  doc.text("Jadson Castro Santana", 105, y, { align: "center" });
  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Eng. Civil", 105, y, { align: "center" });
  y += 5;
  doc.text("CREA: 052062534-1", 105, y, { align: "center" });

  doc.save(`proposta-hbs-${Date.now()}.pdf`);
}
