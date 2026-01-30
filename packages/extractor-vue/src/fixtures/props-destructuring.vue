<script setup lang="ts">
import { plural } from "@lingui/macro"

// Direct props destructuring from defineProps()
// This is the problematic pattern that was causing message-ID mismatches
const { selectedCount, count } = defineProps<{
  selectedCount: number
  count: number
}>()

// Test 1: Destructured prop
const text1 = plural(selectedCount, {
  one: "# item selected",
  other: "# items selected",
})

// Test 2: Also destructured
const text2 = plural(count, {
  one: "# item",
  other: "# items",
})
</script>
