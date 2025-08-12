import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "npm:razorpay";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const razorpay = new Razorpay({
  key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
  key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!,
});

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { amount, currency } = await req.json();

    if (!amount || !currency) {
      return new Response("Amount and currency are required.", { status: 400 });
    }

    const options = {
      amount: amount * 100, // Amount in the smallest currency unit
      currency,
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
        },
      }
    );

    const { data, error } = await supabase
      .from("razorpay_orders")
      .insert({
        razorpay_order_id: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        status: order.status,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ order, orderId: data.id }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(`Error creating Razorpay order: ${error.message}`, {
      status: 500,
    });
  }
});
