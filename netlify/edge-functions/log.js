import { createClient } from "npm:@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_DATABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// https://answers.netlify.com/t/parsing-request-body-event-body-throwing-error/104320

function base64Decode(text) {
  const bufferObj = Buffer.from(text, "utf8");

  const base64String = bufferObj.toString("base64");

  return base64String;
}

export default async function log(req, context) {
  try {
    const requestHeaders = Object.fromEntries(req.headers);
    const userAgent = requestHeaders["user-agent"];

    const serverIp = context.ip;
    const body = await req.json();

    // console.log(body, serverIp);

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
    return new Response(JSON.stringify({ code: 0 }), {
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ code: 1, msg: err.message }), {
      headers: {
        "content-type": "application/json",
      },
    });
  }
}
