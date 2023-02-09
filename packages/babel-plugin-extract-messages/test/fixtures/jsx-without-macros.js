import { Trans } from "@lingui/react"

;<span id="ignore" />

;<Trans id={"msg.hello"} comment="Description" />
;<Trans id="msg.context" context="Context1" />
;<Trans id="msg.notcontext" context="Context1" />
;<Trans id="msg.context" context="Context2" />
;<Trans id="msg.default" message="Hello World" />
;<Trans id="msg.default" message="Hello World" />
;<Trans id="Hi, my name is <0>{name}</0>" values={{ count }} />

