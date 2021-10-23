import React, { useState, useEffect } from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedMap } from "fluid-framework";

const getFluidData = async () => {
  const client = new TinyliciousClient();
  const containerSchema = {
    initialObjects: { sharedTimestamp: SharedMap },
  };
  let container;
  const containerId = window.location.hash.substring(1);
  if (!containerId) {
    ({ container } = await client.createContainer(containerSchema));
    const id = await container.attach();
    window.location.hash = id;
  } else {
    ({ container } = await client.getContainer(containerId, containerSchema));
  }
  return container.initialObjects;
};

function FluidDemo() {
  const [fluidSharedObjects, setFluidSharedObjects] = useState();

  useEffect(() => {
    getFluidData().then((data) => setFluidSharedObjects(data));
  }, []);

  const [localTimestamp, setLocalTimestamp] = React.useState();

  React.useEffect(() => {
    if (fluidSharedObjects) {
      const { sharedTimestamp } = fluidSharedObjects;
      const updateLocalTimestamp = () =>
        setLocalTimestamp({ time: sharedTimestamp.get("time") });

      updateLocalTimestamp();

      sharedTimestamp.on("valueChanged", updateLocalTimestamp);

      return () => {
        sharedTimestamp.off("valueChanged", updateLocalTimestamp);
      };
    } else {
      return; // Do nothing because there is no Fluid SharedMap object yet.
    }
  }, [fluidSharedObjects]);
  if (localTimestamp) {
    return (
      <div className="App">
        <button
          onClick={() =>
            fluidSharedObjects.sharedTimestamp.set(
              "time",
              Date.now().toString()
            )
          }
        >
          Get Time
        </button>
        <span>{localTimestamp.time}</span>
      </div>
    );
  } else {
    return <div />;
  }
}

export default FluidDemo;
