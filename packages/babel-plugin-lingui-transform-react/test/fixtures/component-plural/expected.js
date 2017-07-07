<Trans id="{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}" values={{
  count: count
}} components={[<a href="/more" />]} />;
<Trans id="msg.plural" render="strong" defaults="{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}" values={{
  count: count
}} components={[<a href="/more" />]} />;
<Trans id="inner-id-removed" defaults="Looking for {count, plural, offset:1 =0 {zero items} few {{count} items} other {<0>a lot of them</0>}}" values={{
  count: count
}} components={[<a href="/more" />]} />;
