// https://carbon.now.sh/?bg=rgba(255%2C255%2C255%2C1)&t=solarized%20dark&wt=none&l=jsx&ds=true&dsyoff=20px&dsblur=68px&wc=true&wa=false&pv=33px&ph=27px&ln=false&fm=Fira%20Code&fs=14px&lh=133%25&si=false&code=import%2520*%2520as%2520React%2520from%2520%2522react%2522%250Aimport%2520%257B%2520I18n%252C%2520Trans%252C%2520Plural%2520%257D%2520from%2520%2522%2540lingui%252Freact%2522%250A%250Aexport%2520default%2520function%2520Lingui(%257B%2520numUsers%252C%2520name%2520%253D%2520%2522You%2522%2520%257D)%2520%257B%250A%2520%2520return%2520(%250A%2520%2520%2520%2520%253Cdiv%253E%250A%2520%2520%2520%2520%2520%2520%253Ch1%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%257B%252F*%2520Localized%2520messages%2520are%2520simply%2520wrapped%2520in%2520%253CTrans%253E%2520*%252F%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520%253CTrans%253EInternationalization%2520in%2520React%253C%252FTrans%253E%250A%2520%2520%2520%2520%2520%2520%253C%252Fh1%253E%250A%250A%2520%2520%2520%2520%2520%2520%257B%252F*%2520Element%2520attributes%2520are%2520translated%2520using%2520i18n%2520core%2520object%2520*%252F%257D%250A%2520%2520%2520%2520%2520%2520%253CI18n%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%257B(%257B%2520i18n%2520%257D)%2520%253D%253E%2520(%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%253Cimg%2520src%253D%2522.%252Flogo.png%2522%2520alt%253D%257Bi18n.t%2560Logo%2520of%2520Lingui%2520Project%2560%257D%2520%252F%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520)%257D%250A%2520%2520%2520%2520%2520%2520%253C%252FI18n%253E%250A%250A%2520%2520%2520%2520%2520%2520%253Cp%2520className%253D%2522lead%2522%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%257B%252F*%2520Variables%2520are%2520passed%2520to%2520messages%2520in%2520the%2520same%2520way%2520as%2520in%2520JSX%2520*%252F%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520%253CTrans%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520Hello%2520%257Bname%257D%252C%2520jsLIngui%2520is%2520a%2520readable%252C%2520automated%252C%2520and%2520optimized%2520(5%2520kb)%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520internationalization%2520for%2520JavaScript.%250A%2520%2520%2520%2520%2520%2520%2520%2520%253C%252FTrans%253E%250A%2520%2520%2520%2520%2520%2520%253C%252Fp%253E%250A%250A%2520%2520%2520%2520%2520%2520%257B%252F*%2520Rendering%2520of%2520translation%2520is%2520customizable.%2520Here%2520it%2520renders%2520inside%2520%253Cp%253E%2520*%252F%257D%250A%2520%2520%2520%2520%2520%2520%253CTrans%2520render%253D%2522p%2522%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%257B%252F*%2520Also%2520React%2520Elements%2520inside%2520messages%2520works%2520in%2520the%2520same%2520way%2520as%2520in%2520JSX%2520*%252F%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520Read%2520the%2520%253Ca%2520href%253D%2522https%253A%252F%252Flingui.js.org%2522%253Edocumentation%253C%252Fa%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520for%2520more%2520info.%250A%2520%2520%2520%2520%2520%2520%253C%252FTrans%253E%250A%250A%2520%2520%2520%2520%2520%2520%257B%252F*%250A%2520%2520%2520%2520%2520%2520%2520%2520Plurals%2520are%2520managed%2520using%2520ICU%2520plural%2520rules.%250A%2520%2520%2520%2520%2520%2520%2520%2520Content%2520of%2520one%252Fother%2520slots%2520is%2520localized%2520using%2520%253CTrans%253E.%250A%2520%2520%2520%2520%2520%2520%2520%2520Nesting%2520of%2520i18n%2520components%2520is%2520allowed.%250A%2520%2520%2520%2520%2520%2520%2520%2520Syntactically%2520valid%2520message%2520in%2520ICU%2520MessageFormat%2520is%2520guaranteed.%250A%2520%2520%2520%2520%2520%2520*%252F%257D%250A%2520%2520%2520%2520%2520%2520%253CPlural%250A%2520%2520%2520%2520%2520%2520%2520%2520value%253D%257BnumUsers%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520one%253D%257B%253Cspan%253E%2520Only%2520%253Cstrong%253Eone%253C%252Fstrong%253E%2520user%2520is%2520using%2520this%2520library!%253C%252Fspan%253E%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520other%253D%257B%253Cspan%253E%253Cstrong%253E%257BnumUsers%257D%253C%252Fstrong%253E%2520users%2520are%2520using%2520this%2520library!%253C%252Fspan%253E%257D%250A%2520%2520%2520%2520%2520%2520%252F%253E%250A%2520%2520%2520%2520%253C%252Fdiv%253E%250A%2520%2520)%250A%257D%250A&es=2x&wm=false&ts=false
import * as React from "react"
import { I18n, Trans, Plural } from "@lingui/react"

export default function Lingui({ numUsers, name = "You" }) {
  return (
    <div>
      <h1>
        {/* Localized messages are simply wrapped in <Trans> */}
        <Trans>Internationalization in React</Trans>
      </h1>

      {/* Element attributes are translated using i18n core object */}
      <I18n>
        {({ i18n }) => (
          <img src="./logo.png" alt={i18n.t`Logo of Lingui Project`} />
        )}
      </I18n>

      <p className="lead">
        {/* Variables are passed to messages in the same way as in JSX */}
        <Trans>
          Hello {name}, jsLIngui is a readable, automated, and optimized (5 kb)
          internationalization for JavaScript.
        </Trans>
      </p>

      {/* Rendering of translation is customizable. Here it renders inside <p> */}
      <Trans render="p">
        {/* Also React Elements inside messages works in the same way as in JSX */}
        Read the <a href="https://lingui.js.org">documentation</a>
        for more info.
      </Trans>

      {/*
        Plurals are managed using ICU plural rules.
        Content of one/other slots is localized using <Trans>.
        Nesting of i18n components is allowed.
        Syntactically valid message in ICU MessageFormat is guaranteed.
      */}
      <Plural
        value={numUsers}
        one={
          <span>
            Only <strong>one</strong> user is using this library!
          </span>
        }
        other={
          <span>
            <strong>{numUsers}</strong> users are using this library!
          </span>
        }
      />
    </div>
  )
}
