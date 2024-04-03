<script setup lang="ts">
import { ref, watch } from "vue";
import IconArrowUp from "./IconArrowUp.vue";

export interface ISelectItem {
  id: number | null;
  title: string;
}

interface IProps {
  name: string;
  label: string;
  value: ISelectItem;
  items: ISelectItem[];
  right?: boolean;
}

interface IEmits {
  (e: "change", value: ISelectItem): void;
}

const props = defineProps<IProps>();

const emit = defineEmits<IEmits>();

function changeSelect(value: ISelectItem) {
  emit("change", value);
  visible.value = false;
}

function takeSelect() {
  for (const el of props.items) {
    if (props.value.id === el.id) {
      selectItem.value = {
        id: el.id,
        title: el.title,
      };
      break;
    }
  }
}

watch(
  () => props.value,
  () => {
    if (props.value.id === null)
      selectItem.value = {
        id: null,
        title: "",
      };
    else takeSelect();
  }
);

function changeVisible() {
  visible.value = !visible.value;
}

const visible = ref<boolean>(false);
const selectItem = ref<ISelectItem>({
  id: null,
  title: "",
});

takeSelect();
</script>

<template>
  <div class="select">
    <label
      v-if="props.label"
      class="select__select_label"
      :for="name"
      :class="{ 'select__select_label--selected': selectItem.title }"
    >
      {{ props.label }}
    </label>
    <div
      class="select__select"
      :class="{
        'select__select--selected': selectItem.title,
      }"
      @click="changeVisible"
      @keydown.enter="changeVisible"
      :name="name"
      tabindex="0"
    >
      <span class="select__select_text">
        {{ selectItem.title }}
      </span>
      <span class="icon" :class="{ 'icon--open': visible }">
        <IconArrowUp class="icon-arrow"></IconArrowUp>
      </span>
    </div>
    <div class="select__items" :class="{ 'select__items--visible': visible }">
      <div class="select__items_body">
        <ul class="list">
          <li v-for="i in items" :key="`${i.id}`">
            <a
              class="list__item"
              :class="{
                'list__item--active': selectItem.id === i.id,
              }"
              @click.prevent="
                changeSelect({
                  id: i.id,
                  title: i.title,
                })
              "
            >
              {{ i.title }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.select {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: max-content;
  width: 270px;
  height: 42px;
  &__select {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 42px;
    transition: all 0.3s ease;
    background-color: #0f0f0f98;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
    border-radius: 8px;

    font-size: 20px;
    font-weight: 500;
    font-family: inherit;
    // border-bottom: 1px solid grey;
    // border: 1px solid transparent;
    &--selected {
      // border-bottom: 1px solid white;
    }
    &:hover {
      .icon {
        background-color: rgba(255, 255, 255, 0.1);
        &-arrow {
          // fill: black;
        }
      }
    }
    &_label {
      display: block;
      min-width: max-content;
      margin-right: 10px;
      &--selected {
      }
    }
    &_text {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      // margin-right: 5px;
      padding: 6px 5px;
      color: #ffffff;
    }
  }
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    // border: 0.4px solid white;
    border-radius: 2px 8px 8px 2px;
    width: 24px;
    height: 100%;
    padding: 4px;
    transition: all 0.3s ease-in-out;
    &-arrow {
      transform: rotate(90deg);
      transition: all 0.3s ease-in-out;
    }
    &--open {
      background-color: rgba(255, 255, 255, 0.1);
      .icon-arrow {
        transform: rotate(180deg);
        // fill: black;
      }
    }
  }
  &__items {
    width: 100%;
    position: absolute;
    left: 0;
    bottom: -5px;
    transform: translate(0, 100%);
    z-index: 8;
    padding: 6px 5px;
    visibility: hidden;
    opacity: 0;
    max-height: 0;
    transition: all 0.3s ease-in-out;
    overflow: hidden;
    background-color: #0f0f0f;
    border-radius: 8px;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
    &--visible {
      visibility: visible;
      opacity: 1;
      max-height: 400px;
    }
    &_body {
      .list {
        overflow: hidden;
        overflow-y: auto;
        max-height: 280px;
        &__item {
          display: block;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 5px;
          color: white;
          font-size: 18px;
          &:hover,
          &--active {
            color: #396cd8;
          }
          a {
            color: inherit;
            font-size: inherit;
            font-weight: inherit;
          }
        }
      }
    }
  }
}
</style>
