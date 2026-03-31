import { type MaybeRefOrGetter, computed, ref, toValue } from 'vue';

export function usePagination<T>(
    items: MaybeRefOrGetter<T[]>,
    itemsPerPage: number,
    disable = ref(false)
) {
    const currentPage = ref(1);

    const totalPages = computed(() => {
        const list = toValue(items);
        return Math.max(1, Math.ceil(list.length / itemsPerPage));
    });

    const paginatedItems = computed(() => {
        const list = toValue(items);

        if (disable.value) {
            return list;
        }

        const start = (currentPage.value - 1) * itemsPerPage;
        return list.slice(start, start + itemsPerPage);
    });

    const changePage = (page: number) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    };

    const resetPage = () => {
        currentPage.value = 1;
    };

    return {
        currentPage,
        totalPages,
        paginatedItems,
        changePage,
        resetPage
    };
}
