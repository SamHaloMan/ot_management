<template>
    <div class="overtime">
        <h1 class="mb-4">Overtime</h1>
        <ul class="nav nav-pills mb-4">
            <li class="nav-item">
                <router-link :to="{ name: 'OvertimeForm' }" class="nav-link"
                    :class="{ active: $route.name === 'OvertimeForm' }">
                    Request Form
                </router-link>
            </li>
            <li class="nav-item">
                <router-link :to="{ name: 'OvertimeHistory' }" class="nav-link"
                    :class="{ active: $route.name === 'OvertimeHistory' }">
                    History
                </router-link>
            </li>
        </ul>
        <router-view />
    </div>
</template>

<style scoped>
.nav-link {
    cursor: pointer;
}

.nav-link.active {
    background-color: #007bff;
    color: #fff;
}
</style>