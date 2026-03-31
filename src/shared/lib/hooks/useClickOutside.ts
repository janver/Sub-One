import { type Ref, onMounted, onUnmounted } from 'vue';

export function useClickOutside(
    targetRef: Ref<HTMLElement | null>,
    enabledRef: Ref<boolean>,
    onOutside: () => void
) {
    const handleClickOutside = (event: Event) => {
        const target = event.target as globalThis.Node;

        if (enabledRef.value && targetRef.value && !targetRef.value.contains(target)) {
            onOutside();
        }
    };

    onMounted(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside);
    });
}
