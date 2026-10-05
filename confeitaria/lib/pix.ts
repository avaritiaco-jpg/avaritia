// "Pix copia e cola" (BR Code estático do Banco Central, padrão EMV), gerado no navegador.
// Não precisa de banco nem de servidor: o app do cliente lê a chave, o nome, a cidade e o valor.

const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

/** Sem acentos e só com caracteres aceitos pelos apps dos bancos */
const ascii = (s: string, max: number) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 .,-]/g, "")
    .trim()
    .slice(0, max);

// CRC16-CCITT (polinômio 0x1021, início 0xFFFF), exigido no campo 63
function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function pixPayload({
  key,
  receiver,
  city,
  amount,
  txid,
}: {
  key: string;
  receiver: string;
  city: string;
  amount: number;
  /** identificador do pedido (até 25 letras e números) */
  txid: string;
}) {
  const account = field("00", "br.gov.bcb.pix") + field("01", key.trim());
  const body =
    field("00", "01") +
    field("26", account) +
    field("52", "0000") +
    field("53", "986") +
    (amount > 0 ? field("54", amount.toFixed(2)) : "") +
    field("58", "BR") +
    field("59", ascii(receiver, 25) || "RECEBEDOR") +
    field("60", ascii(city, 15) || "BRASIL") +
    field("62", field("05", txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***")) +
    "6304";
  return body + crc16(body);
}
