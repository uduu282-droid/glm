async function testVision() {
  try {
    console.log('Testing vision model...\n');
    const res = await fetch("https://qwen-worker-proxy.ronitshrimankar1.workers.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "vision-model",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "What do you see in this image? Reply in one sentence." },
            { type: "image_url", image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png" }}
          ]
        }],
        max_tokens: 100
      })
    });

    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Response data:\n", JSON.stringify(data, null, 2));
    
    if (res.ok && data.choices?.[0]?.message?.content) {
      console.log("\n✅ SUCCESS! Vision model response:");
      console.log(data.choices[0].message.content);
    } else {
      console.log("\n❌ FAILED!");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testVision();
