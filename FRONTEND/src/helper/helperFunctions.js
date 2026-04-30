export const generateNestedFolders = (depth = 20) => {
    let root = {
        name: "My Files",
        path: "/app/files",
        children: [],
    };

    let current = root;

    for (let i = 1; i <= depth; i++) {
        const node = {
            name: `Level ${i}`,
            path: `/app/level-${i}`, // ✅ unique
            children: [],
        };

        current.children = [node];
        current = node;
    }

    return [root];
};