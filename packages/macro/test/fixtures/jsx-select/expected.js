<Trans id="{count, select, male {He} female {She} other {<0>Other</0>}}" values={{
  count: count
}} components={{
  0: <strong />
}} />;
<Trans render="strong" id="msg.select" defaults="{0, select, male {He} female {She} other {<0>Other</0>}}" values={{
  0: user.gender
}} components={{
  0: <strong />
}} />;
