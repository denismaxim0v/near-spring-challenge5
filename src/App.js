import "regenerator-runtime/runtime";
import { login, logout } from "./utils";
import "./global.css";
import BN from "bn.js";
import React, { useRef, Suspense, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

import getConfig from "./config";
const { networkId } = getConfig("development");

function randomAngleTriple() {
  return [
    2 * Math.PI * Math.random(),
    2 * Math.PI * Math.random(),
    2 * Math.PI * Math.random(),
  ];
}

function Planet() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[35, 100, 100]} />
      <meshLambertMaterial color={0x5e3713} />
    </mesh>
  );
}

function Tree() {
  let angles = randomAngleTriple();
  return (
    <group rotation={angles}>
      <mesh position={[0, 35 + 0.75, 0]} scale={[0.3, 1.5, 0.3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color={0x7d5a4f} />
      </mesh>
      <mesh position={[0, 35 + 1.2, 0]} scale={[1, 2, 1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color={0x91e56e} />
      </mesh>
      <mesh position={[0, 35 + 1.2, 0]} scale={[1.4, 0.5, 1.4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color={0xa2ff7a} />
      </mesh>
    </group>
  );
}

export default function App() {
  const [nftData, setNftData] = React.useState();

  const [treeCount, setTreeCount] = React.useState();

  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const [showNotification, setShowNotification] = React.useState(false);

  const ref = useRef();

  React.useEffect(() => {
    // in this case, we only care to query the contract when signed in
    if (window.walletConnection.isSignedIn()) {
      // window.contract is set by initContract in index.js
      console.log(window.accountId);
      window.contract
        .check_token({ id: `${window.accountId}-APE-Trees` })
        .then((response) => {
          if (response == true) {
            window.contract
              .nft_token({ token_id: `${window.accountId}-APE-Trees` })
              .then((response) => {
                console.log(response);
                setNftData(response);
                if (response.length > 0) {
                  setButtonDisabled(true);
                  setShowNotification(true);
                }
              });
          } else {
            setButtonDisabled(false);
          }
        });
    }
    window.contract.tree_count().then((res) => {
      setTreeCount(res);
    });
  }, []);
  let final = [];
  for (let i = 0; i < treeCount; i++) {
    final.push(<Tree key={"tree" + i} />);
  }

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>
          Team Trees <br />
          <span className="treeCount">
            Trees Planted So Far: <b>{treeCount}</b>
          </span>
                 <p>To buy a Tree nft please sign in</p>

        </h1>
        <div className="earth">
          <Canvas dpr={[100, 2]} camera={{ position: [80, 0, 0], fov: 60 }}>
            <ambientLight color={0x7d7d7d} />
            <directionalLight
              color={0xe9f7e1}
              intensity={1}
              position={[0, 0, 1]}
            />
            <Suspense fallback={null}>
              <Planet />
              <Environment preset="city" />
              {final}
            </Suspense>
            <OrbitControls ref={ref} autoRotate={true} />
          </Canvas>
        </div>
        <p style={{ textAlign: "center", marginTop: "2.5em" }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    );
  }
  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: "right" }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <label
            htmlFor="greeting"
            style={{
              color: "var(--secondary)",
              borderBottom: "2px solid var(--secondary)",
            }}
          ></label>
          {
            " " /* React trims whitespace around tags; insert literal space character when needed */
          }
          {window.accountId}! <br />
          <span className="treeCount">
            Trees Planted So Far: <b>{treeCount}</b>
          </span>
        </h1>
        <div className="earth">
          <Canvas dpr={[100, 2]} camera={{ position: [80, 0, 0], fov: 60 }}>
            <ambientLight color={0x7d7d7d} />
            <directionalLight
              color={0xe9f7e1}
              intensity={1}
              position={[0, 0, 1]}
            />
            <Suspense fallback={null}>
              <Planet />
              <Environment preset="city" />
              {final}
            </Suspense>
            <OrbitControls ref={ref} autoRotate={true} />
          </Canvas>
        </div>
        <form
          onSubmit={async (event) => {
            event.preventDefault();

            fieldset.disabled = true;

            try {
              // make an update call to the smart contract
              await window.contract.nft_mint(
                {
                  token_id: `${window.accountId}-APE-Trees`,
                  metadata: {
                    title: "APE Trees",
                    description: `Thank you for planting a tree`,
                    media: "https://i.postimg.cc/dt6NX4ZV/ape.png",
                  },
                  receiver_id: window.accountId,
                  perpetual_royalties: {
                    "team-trees-foundation.denismaxim0v.testnet": 100000,
                  },
                },
                // fails without this?
                300000000000000,
                new BN("1000000000000000000000000")
              );
            } catch (e) {
              alert(
                "Something went wrong! " +
                  "Maybe you need to sign out and back in? " +
                  "Check your browser console for more info."
              );
              throw e;
            } finally {
              // re-enable the form, whether the call succeeded or failed
              fieldset.disabled = false;
            }
            setTimeout(() => {
              setShowNotification(false);
            }, 11000);
          }}
        >
          <fieldset id="fieldset">
            {!showNotification && (
              <p
                style={{
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                All funds will be donated to Team Trees Foundation.
              </p>
            )}
            <div
              style={{
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: "0 5px 5px 0" }}
              >
                Plant a tree!
              </button>
            </div>
          </fieldset>
        </form>
      </main>
      {showNotification && <Notification />}
    </>
  );
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`;
  return (
    <aside>
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.accountId}`}
      >
        {window.accountId}
      </a>
      {
        " " /* React trims whitespace around tags; insert literal space character when needed */
      }
      called method: 'mint_nft' in contract:{" "}
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.contract.contractId}`}
      >
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  );
}
