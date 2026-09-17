<script setup lang="ts">
import { useLingui } from "@lingui/vue/macro"

const { name } = defineProps<{ name: string }>()

const { t } = useLingui()

const greeting = t`Hello ${name}`
</script>
