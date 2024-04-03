<script setup lang="ts">
import Button from "./Button.vue";
import Input from "./Input.vue";
import { ref } from "vue";
import { config } from "../app";

interface IProps {
  show: boolean;
}

interface IEmits {
  (e: "cancel"): void;
}

const props = defineProps<IProps>();

const emit = defineEmits<IEmits>();

const titleVariant = ref("");

function changeTitle(value: string | number | boolean) {
  titleVariant.value = String(value);
}

function addVariant() {
  config.addMainVariantConfig(titleVariant.value);
  emit("cancel");
}

function cancel() {
  emit("cancel");
}
</script>

<template>
  <Teleport to="#modals">
    <div v-show="props.show" class="add-modal">
      <Input
        type="text"
        name="title-variant"
        label="Title Variant:"
        :value="titleVariant"
        @change="changeTitle"
      />
      <div class="add-modal__footer">
        <Button type="button" text="Add" @click="addVariant" />
        <Button type="button" text="Cancel" @click="cancel" />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
.add-modal {
  position: fixed;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px 20px 10px;
  border-radius: 10px;
  border: 1px solid #f6f6f6;
  background-color: #2f2f2f;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  &__footer {
    width: 100%;
    margin-top: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    & > :last-child {
      margin-left: 6px;
    }
  }
}
</style>
