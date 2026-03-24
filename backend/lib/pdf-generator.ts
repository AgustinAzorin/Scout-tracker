export async function generateActivityPdf(title: string, body: string): Promise<Buffer> {
  const plainText = `${title}\n\n${body}`;
  return Buffer.from(plainText, "utf-8");
}