import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from "@react-email/components";

const main = {
  backgroundColor: "#ffffff",
  color: "#24292e",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const container = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "20px 0 48px",
};

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
};

const section = {
  padding: "24px",
  border: "solid 1px #dedede",
  borderRadius: "5px",
  textAlign: "center" as const,
};

const text = {
  margin: "0 0 10px 0",
  textAlign: "left" as const,
  whiteSpace: "pre-line" as const,
};

const links = {
  textAlign: "center" as const,
};

const link = {
  color: "#5e37ff",
  fontSize: "14px",
};

const footer = {
  color: "#6a737d",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "60px",
};

interface NuovaFatturaEmailProps {
  nomeUtente: string;
  message?: string;
}

const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/8/85/Logo-Test.png";

export function NuovaFatturaEmail({
  message,
  nomeUtente,
}: NuovaFatturaEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>
          Hai ricevuto una nuova fattura da
          {" "}
          {nomeUtente}
        </Preview>
        <Container style={container}>
          <Img
            src={logoUrl}
            width="32"
            height="32"
            alt="Fatturex"
          />

          <Text style={title}>
            <strong>{nomeUtente}</strong>
            {" "}
            ti ha inviato una fattura.
          </Text>

          <Section style={section}>
            <Text style={text}>{message}</Text>
          </Section>
          <Text style={links}>
            <Link style={link}>Puoi trovare la fattura in allegato a questa email.</Link>
          </Text>

          <Text style={footer}>
            Fatturex - Via Roma, 123 - 00100 Roma (RM)
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default NuovaFatturaEmail;
