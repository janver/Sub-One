import { type MaybeRefOrGetter, toValue, watch } from 'vue';

export function useTabActionTrigger(
    action: MaybeRefOrGetter<{ action: string } | null | undefined>,
    actionName: string,
    onMatched: () => void
) {
    watch(
        () => toValue(action),
        (value) => {
            if (value?.action === actionName) {
                onMatched();
            }
        },
        { immediate: true }
    );
}
