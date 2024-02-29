just: check test

check:
    deno fmt
    deno lint

test:
    deno test

dev:
    deno task start