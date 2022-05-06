import React from "react"
import { storiesOf } from "@storybook/react"
import TezosDarkblockWidget from "../lib/TezWidget"

const stories = storiesOf("Tezos Darkblock Widget", module)

stories.add("App", () => {
  return (
    <TezosDarkblockWidget
      contractAddress="KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS"
      tokenId="44635"
      wa={{ something: "blah" }}
      cb={(p) => console.log(p)}
    />
  )
})
