import { CapacitorHttp } from "@capacitor/core";
import React from "react";

const CapacitorHttpComponent = () => {
  // Example of a GET request
  const doGet = async () => {
    const options = {
      url: "https://example.com/my/api",
      headers: { "X-Fake-Header": "Fake-Value" },
      params: { size: "XL" },
    };

    const response = await CapacitorHttp.get(options);
    console.log("__response", response);

    // or...
    // const response = await CapacitorHttp.request({ ...options, method: 'GET' })
  };

  // Example of a POST request. Note: data
  // can be passed as a raw JS Object (must be JSON serializable)
  const doPost = async () => {
    const options = {
      url: "https://example.com/my/api",
      headers: { "X-Fake-Header": "Fake-Value" },
      data: { foo: "bar" },
    };

    const response = await CapacitorHttp.post(options);
    console.log("__response post", response);

    // or...
    // const response = await CapacitorHttp.request({ ...options, method: 'POST' })
  };
  return (
    <div>
      <button onClick={doPost}>Post</button>
      <button onClick={doGet}>Get</button>
    </div>
  );
};

export default CapacitorHttpComponent;
