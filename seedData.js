/* ==========================================================================
   INITIAL SEED DATA — CATEGORIAS E SUBCATEGORIAS (CONTEÚDO EM BRANCO)
   ========================================================================== */

export const INITIAL_MODULES = [
  {
    id: "mod-1",
    order_index: 1,
    slug: "dashboard",
    title: "Dashboard",
    description: "",
    subtopics: [
      { id: "sub-1-1", order_index: 1, slug: "visao-geral-operacao", title: "Visão geral da operação", content_html: "", lead_text: "" },
      { id: "sub-1-2", order_index: 2, slug: "tipos-motorista", title: "Tipos de motorista", content_html: "", lead_text: "" },
      { id: "sub-1-3", order_index: 3, slug: "clientes", title: "Clientes", content_html: "", lead_text: "" },
      { id: "sub-1-4", order_index: 4, slug: "movimentacao-viagens", title: "Movimentação de viagens", content_html: "", lead_text: "" },
      { id: "sub-1-5", order_index: 5, slug: "rankings", title: "Rankings", content_html: "", lead_text: "" }
    ]
  },
  {
    id: "mod-2",
    order_index: 2,
    slug: "gestao-usuarios",
    title: "Gestão de Usuários",
    description: "",
    subtopics: [
      { id: "sub-2-1", order_index: 1, slug: "clientes", title: "Clientes", content_html: "", lead_text: "" },
      { id: "sub-2-2", order_index: 2, slug: "motoristas", title: "Motoristas", content_html: "", lead_text: "" }
    ]
  },
  {
    id: "mod-3",
    order_index: 3,
    slug: "operacao-viagens",
    title: "Operação e Viagens",
    description: "",
    subtopics: [
      { id: "sub-3-1", order_index: 1, slug: "monitoramento", title: "Monitoramento", content_html: "", lead_text: "" },
      { id: "sub-3-2", order_index: 2, slug: "viagens-delivery", title: "Viagens e Delivery", content_html: "", lead_text: "" },
      { id: "sub-3-3", order_index: 3, slug: "grupos-chamados", title: "Grupos de Chamados", content_html: "", lead_text: "" }
    ]
  },
  {
    id: "mod-4",
    order_index: 4,
    slug: "taxas-financeiro",
    title: "Taxas e Financeiro",
    description: "",
    subtopics: [
      { id: "sub-4-1", order_index: 1, slug: "financeiro", title: "Financeiro", content_html: "", lead_text: "" },
      { id: "sub-4-2", order_index: 2, slug: "configuracao-taxas", title: "Configuração de Taxas", content_html: "", lead_text: "" }
    ]
  },
  {
    id: "mod-5",
    order_index: 5,
    slug: "comunicacao-relatorios",
    title: "Comunicação e Relatórios",
    description: "",
    subtopics: [
      { id: "sub-5-1", order_index: 1, slug: "mensagens-fale-conosco", title: "Mensagens e Fale Conosco", content_html: "", lead_text: "" },
      { id: "sub-5-2", order_index: 2, slug: "relatorios", title: "Relatórios", content_html: "", lead_text: "" }
    ]
  },
  {
    id: "mod-6",
    order_index: 6,
    slug: "avancadas-sistema",
    title: "Avançadas e Sistema",
    description: "",
    subtopics: [
      { id: "sub-6-1", order_index: 1, slug: "mapas-zonas-risco", title: "Mapas e Zonas de Risco", content_html: "", lead_text: "" },
      { id: "sub-6-2", order_index: 2, slug: "perfil-administrador", title: "Perfil de Administrador", content_html: "", lead_text: "" }
    ]
  }
];
