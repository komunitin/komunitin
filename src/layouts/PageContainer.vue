<template>
  <div>
    <q-header reveal bordered>
        <slot name="toolbar">
            <q-toolbar>
            <q-btn flat round icon="menu" @click="left = !left" />
            <q-toolbar-title>
                Title
            </q-toolbar-title>
            </q-toolbar>
        </slot>
    </q-header>
    <q-page-container>
        <slot/>
    </q-page-container>
  </div>
</template>