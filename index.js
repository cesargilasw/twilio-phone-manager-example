import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

// Ejecutar: node index.js test
//           node index.js real
const mode = process.argv[2] || "test";

console.log("\n=== MODO: ===\n");

const SID  = mode === "real" ? process.env.TWILIO_ACCOUNT_SID : process.env.TWILIO_TEST_SID;
const TOKEN = mode === "real" ? process.env.TWILIO_AUTH_TOKEN : process.env.TWILIO_TEST_TOKEN;

const client = twilio(SID, TOKEN);

async function run() {
  try {
    console.log("Buscando numero disponible...");

    const numbers = await client.availablePhoneNumbers(process.env.PHONE_COUNTRY)
      .local
      .list({
        areaCode: process.env.AREA_CODE,
        limit: 1
      });

    if (numbers.length === 0) {
      console.log("No hay numeros disponibles.");
      return;
    }

    const num = numbers[0].phoneNumber;
    console.log("Numero encontrado:", num);

    console.log("\nIntentando comprar (en modo test fallará):");

    const purchased = await client.incomingPhoneNumbers.create({
      phoneNumber: num,
    });

    console.log("Número comprado:", purchased.phoneNumber);

    if (mode === "real") {
      await client.incomingPhoneNumbers(purchased.sid).update({
        smsUrl: process.env.SMS_WEBHOOK,
        voiceUrl: process.env.VOICE_WEBHOOK
      });

      console.log("Webhooks configurados.");
    }

  } catch (err) {
    console.error("\\nError:");
    console.error(err.message);
  }
}

run();
