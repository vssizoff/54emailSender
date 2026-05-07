import {createRouter, createWebHashHistory} from "vue-router";

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: "root",
            path: "/",
            component: () => import("@renderer/views/MainView.vue")
        },
        {
            name: "template",
            path: "/template/:index",
            component: () => import("@renderer/views/TemplateEditorView.vue")
        }
    ]
});