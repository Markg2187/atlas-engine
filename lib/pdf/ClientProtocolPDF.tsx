import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Client, ClientProtocol, Protocol } from "@/lib/types";

Font.register({
  family: "DM Sans",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZOIHTWEBlwu8Q.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZOIHTWEBlwu8Q.woff2",
      fontWeight: 700,
    },
  ],
});

export interface PeptideForPDF {
  name: string;
  summary: string | null;
  route: string | null;
  benefits: string[];
  recon_steps: string[] | null;
  storage: string | null;
  timing: string | null;
  vial_size: string | null;
  is_brand_product: boolean;
  brand: string | null;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "DM Sans",
    color: "#0f1a2e",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "2 solid #c9973a",
  },
  logoText: { fontSize: 22, fontWeight: 700, color: "#c9973a", marginBottom: 4 },
  tagline: { fontSize: 9, color: "#5a6a7a", letterSpacing: 1, textTransform: "uppercase" },
  title: { fontSize: 20, fontWeight: 700, color: "#0f1a2e", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#5a6a7a", marginBottom: 16 },
  section: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderLeft: "2 solid #c9973a",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#c9973a",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 8, color: "#5a6a7a", textTransform: "uppercase", letterSpacing: 0.5, width: "40%" },
  value: { fontSize: 9, color: "#0f1a2e", width: "58%" },
  peptideBadge: { backgroundColor: "#e8e0d0", borderRadius: 4, padding: "3 8", marginRight: 4, marginBottom: 4 },
  peptideBadgeText: { fontSize: 8, color: "#c9973a" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  monthCard: { backgroundColor: "#f5f3ee", borderRadius: 4, padding: 10, marginBottom: 8 },
  monthTitle: { fontSize: 10, fontWeight: 700, color: "#0f1a2e", marginBottom: 6 },
  monthNote: { fontSize: 8, color: "#5a6a7a", marginBottom: 6, lineHeight: 1.4 },
  tableHeader: { flexDirection: "row", borderBottom: "1 solid #e8e0d0", paddingBottom: 4, marginBottom: 4 },
  tableHeaderText: { fontSize: 7, color: "#5a6a7a", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", paddingVertical: 3 },
  tableCell: { fontSize: 8, color: "#0f1a2e" },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f3ee",
    borderRadius: 4,
    borderLeft: "2 solid #e8b86d",
  },
  disclaimerText: { fontSize: 7, color: "#5a6a7a", lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #e8e0d0",
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: "#5a6a7a" },

  // Page 2 — peptide guide styles
  guideHeader: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "2 solid #c9973a",
  },
  guideTitle: { fontSize: 18, fontWeight: 700, color: "#c9973a", marginBottom: 4 },
  guideSubtitle: { fontSize: 9, color: "#5a6a7a", textTransform: "uppercase", letterSpacing: 1 },
  peptideSection: {
    marginBottom: 18,
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderLeft: "3 solid #c9973a",
  },
  peptideName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#c9973a",
    marginBottom: 3,
  },
  peptideMeta: { fontSize: 8, color: "#5a6a7a", marginBottom: 8 },
  subHeading: {
    fontSize: 8,
    fontWeight: 700,
    color: "#54c7a2",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  bodyText: { fontSize: 9, color: "#0f1a2e", lineHeight: 1.5 },
  bulletRow: { flexDirection: "row", marginBottom: 3 },
  bullet: { fontSize: 9, color: "#c9973a", width: 12 },
  bulletText: { fontSize: 9, color: "#0f1a2e", flex: 1, lineHeight: 1.4 },
  stepRow: { flexDirection: "row", marginBottom: 4 },
  stepNum: {
    fontSize: 8,
    fontWeight: 700,
    color: "#c9973a",
    width: 18,
    height: 14,
    backgroundColor: "#e8e0d0",
    borderRadius: 3,
    textAlign: "center",
    paddingTop: 1,
  },
  stepText: { fontSize: 9, color: "#0f1a2e", flex: 1, lineHeight: 1.4, marginLeft: 6 },
  infoBox: {
    backgroundColor: "#f5f3ee",
    borderRadius: 4,
    padding: "6 10",
    marginTop: 6,
    flexDirection: "row",
    gap: 6,
  },
  infoLabel: { fontSize: 7, color: "#5a6a7a", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 8, color: "#0f1a2e" },
  brandBadge: {
    backgroundColor: "#eaf3de",
    borderRadius: 3,
    padding: "2 6",
    marginLeft: 6,
  },
  brandBadgeText: { fontSize: 7, color: "#54c7a2" },
});

function injectInstructions(route: string | null): string {
  switch (route) {
    case "subcutaneous":
      return "Pinch a fold of skin on your abdomen or thigh. Insert the needle at a 45° angle into the fat layer just under the skin. Inject slowly, then withdraw and apply light pressure. Rotate injection sites each day.";
    case "intramuscular":
      return "Inject into the outer thigh or deltoid muscle at a 90° angle. Ensure the needle enters the muscle (not just fat). Aspirate briefly, then inject slowly and withdraw.";
    case "intranasal":
      return "Tilt head slightly back. Insert the dropper or nasal spray into one nostril, squeeze gently while inhaling lightly through the nose. Repeat for the other nostril. Stay upright for 2 minutes.";
    case "oral":
      return "Take orally as directed — typically placed under the tongue (sublingual) or swallowed. Do not eat or drink for 30 minutes after dosing.";
    case "intravenous":
      return "Administered by a healthcare provider via IV push or slow infusion. Do not self-administer IV injections without proper training.";
    default:
      return "Administer as directed by your healthcare provider. Follow all preparation and injection protocols provided to you.";
  }
}

interface PDFProps {
  client: Client;
  protocol: Protocol;
  clientProtocol: ClientProtocol;
  generatedDate?: string;
  peptideGuide?: PeptideForPDF[];
}

export function ClientProtocolPDF({
  client,
  protocol,
  clientProtocol,
  generatedDate,
  peptideGuide = [],
}: PDFProps) {
  const months = protocol.months || [];
  const dateStr = generatedDate || new Date().toLocaleDateString();

  return (
    <Document>
      {/* ── PAGE 1: Protocol Overview ──────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Atlas Engine</Text>
          <Text style={styles.tagline}>Peptide Protocol Management Platform</Text>
        </View>

        <Text style={styles.title}>
          {client.first_name} {client.last_name} — Treatment Protocol
        </Text>
        <Text style={styles.subtitle}>
          {protocol.condition_name} · Generated {dateStr}
        </Text>

        {/* Client details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{client.first_name} {client.last_name}</Text>
          </View>
          {client.weight_lbs && (
            <View style={styles.row}>
              <Text style={styles.label}>Weight</Text>
              <Text style={styles.value}>{client.weight_lbs} lbs ({client.weight_kg} kg)</Text>
            </View>
          )}
          {client.sex && (
            <View style={styles.row}>
              <Text style={styles.label}>Sex</Text>
              <Text style={styles.value}>{client.sex}</Text>
            </View>
          )}
          {clientProtocol.start_date && (
            <View style={styles.row}>
              <Text style={styles.label}>Protocol Start</Text>
              <Text style={styles.value}>{clientProtocol.start_date}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Total Duration</Text>
            <Text style={styles.value}>{clientProtocol.total_months} months</Text>
          </View>
        </View>

        {/* Protocol overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Protocol: {protocol.condition_name}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{protocol.category}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Primary Peptide</Text>
            <Text style={[styles.value, { color: "#c9973a" }]}>{protocol.primary_peptide}</Text>
          </View>
          {protocol.adjunct_peptides && protocol.adjunct_peptides.length > 0 && (
            <View>
              <Text style={[styles.label, { marginTop: 4 }]}>Adjunct Peptides</Text>
              <View style={styles.badgeRow}>
                {protocol.adjunct_peptides.map((p) => (
                  <View key={p} style={styles.peptideBadge}>
                    <Text style={styles.peptideBadgeText}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {protocol.cycle_intro && (
            <Text style={[styles.value, { marginTop: 8, fontSize: 8, lineHeight: 1.5, color: "#5a6a7a" }]}>
              {protocol.cycle_intro}
            </Text>
          )}
        </View>

        {/* Monthly schedule */}
        {months.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Cycling Schedule</Text>
            {months.map((month) => (
              <View key={month.id} style={styles.monthCard}>
                <Text style={styles.monthTitle}>
                  Month {month.month_number}: {month.title}
                </Text>
                {month.clinical_note && (
                  <Text style={styles.monthNote}>{month.clinical_note}</Text>
                )}
                {month.rows && month.rows.length > 0 && (
                  <View>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, { width: "35%" }]}>Peptide</Text>
                      <Text style={[styles.tableHeaderText, { width: "30%" }]}>Dose</Text>
                      <Text style={[styles.tableHeaderText, { width: "35%" }]}>Schedule</Text>
                    </View>
                    {month.rows.map((row) => (
                      <View key={row.id} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: "35%", color: "#c9973a" }]}>
                          {row.peptide_name}
                        </Text>
                        <Text style={[styles.tableCell, { width: "30%" }]}>{row.dose}</Text>
                        <Text style={[styles.tableCell, { width: "35%", color: "#5a6a7a" }]}>
                          {row.schedule}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            DISCLAIMER: This protocol document is for informational purposes only and is intended for use
            under the supervision of a licensed healthcare practitioner. Peptide therapies should be
            administered under appropriate medical guidance. Doses may need adjustment based on individual
            response. Atlas Engine does not provide medical advice.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Atlas Engine — Confidential</Text>
          <Text style={styles.footerText}>{dateStr}</Text>
        </View>
      </Page>

      {/* ── PAGE 2: Your Peptides Guide ───────────────────── */}
      {peptideGuide.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.guideHeader}>
            <Text style={styles.guideTitle}>Your Peptides Guide</Text>
            <Text style={styles.guideSubtitle}>
              What each peptide does, how to use it, and what to expect
            </Text>
          </View>

          {peptideGuide.map((p) => (
            <View key={p.name} style={styles.peptideSection} wrap={false}>
              {/* Name + brand badge */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                <Text style={styles.peptideName}>{p.name}</Text>
                {p.is_brand_product && p.brand && (
                  <View style={styles.brandBadge}>
                    <Text style={styles.brandBadgeText}>{p.brand}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.peptideMeta}>
                Route: {p.route ?? "subcutaneous"}{p.vial_size ? ` · ${p.vial_size}` : ""}
              </Text>

              {/* What it is */}
              {p.summary && (
                <>
                  <Text style={styles.subHeading}>What It Is</Text>
                  <Text style={styles.bodyText}>{p.summary}</Text>
                </>
              )}

              {/* Key benefits */}
              {p.benefits.length > 0 && (
                <>
                  <Text style={styles.subHeading}>Key Benefits</Text>
                  {p.benefits.slice(0, 5).map((b, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* How to reconstitute */}
              {p.recon_steps && p.recon_steps.length > 0 && (
                <>
                  <Text style={styles.subHeading}>How to Reconstitute Your Vial</Text>
                  {p.recon_steps.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <Text style={styles.stepNum}>{i + 1}</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* How to inject */}
              <Text style={styles.subHeading}>How to Inject</Text>
              <Text style={styles.bodyText}>{injectInstructions(p.route)}</Text>

              {/* Storage + timeline side by side */}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                {p.storage && (
                  <View style={[styles.infoBox, { flex: 1 }]}>
                    <View>
                      <Text style={styles.infoLabel}>Storage</Text>
                      <Text style={styles.infoValue}>{p.storage}</Text>
                    </View>
                  </View>
                )}
                {p.timing && (
                  <View style={[styles.infoBox, { flex: 1 }]}>
                    <View>
                      <Text style={styles.infoLabel}>When to Expect Results</Text>
                      <Text style={styles.infoValue}>{p.timing}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Atlas Engine — Patient Guide</Text>
            <Text style={styles.footerText}>{dateStr}</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
