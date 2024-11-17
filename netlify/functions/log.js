// import { createClient } from "@supabase/supabase-js";
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_DATABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
// exports.handler = async function(event, context) {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({ message: "Hello World" })
//   };
// };

// https://answers.netlify.com/t/parsing-request-body-event-body-throwing-error/104320

// function base64Decode(text) {
//   const bufferObj = Buffer.from(text, "utf8");

//   const base64String = bufferObj.toString("base64");

//   return base64String;
// }

exports.handler = async function (event, context) {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));

  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const userAgent = event.headers["user-agent"];
    const serverIp = context.ip;
    console.log(userAgent, serverIp);
    const body = JSON.parse(event.body);

    if (
      !body.device_type ||
      !"press_count" in body ||
      !"long_press_count" in body ||
      !body.position
    ) {
      throw new Error("invalid params");
    }

    const {
      user_ip,
      device_type,
      press_count,
      long_press_count,
      position,
      unique_id,
    } = body;

    console.log(
      `UA[${userAgent}], serverIp[${serverIp}], user_ip[${user_ip}], device_type[${device_type}], position[${position}], press_count[${press_count}], long_press_count[${long_press_count}] unique_id[${unique_id}]`
    );

    const { error } = await supabase.from("adlog").insert({
      server_ip: serverIp,
      id: Math.floor((Date.now() + Math.random()) * 100),
      created_at: new Date().toISOString(),
      // Date.now(),
      user_ip,
      device_type,
      press_count,
      long_press_count,
      position,
      unique_id,
      user_agent: userAgent,
    });

    if (error) {
      console.warn("db error: ", error.message);
      throw error;
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ code: 0 }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ code: 1, msg: err.message }),
    };
  }
};
