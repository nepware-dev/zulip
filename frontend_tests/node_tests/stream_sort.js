"use strict";

const {strict: assert} = require("assert");

const {zrequire} = require("../zjsunit/namespace");
const {run_test} = require("../zjsunit/test");

const stream_data = zrequire("stream_data");
const stream_sort = zrequire("stream_sort");

const scalene = {
    subscribed: true,
    name: "scalene",
    stream_id: 1,
    pin_to_top: true,
};
const fast_tortoise = {
    subscribed: true,
    name: "fast tortoise",
    stream_id: 2,
    pin_to_top: false,
};
const pneumonia = {
    subscribed: true,
    name: "pneumonia",
    stream_id: 3,
    pin_to_top: false,
};
const clarinet = {
    subscribed: true,
    name: "clarinet",
    stream_id: 4,
    pin_to_top: false,
};
const weaving = {
    subscribed: false,
    name: "weaving",
    stream_id: 5,
    pin_to_top: false,
};
const muted_active = {
    subscribed: true,
    name: "muted active",
    stream_id: 6,
    pin_to_top: false,
    is_muted: true,
};
const muted_pinned = {
    subscribed: true,
    name: "muted pinned",
    stream_id: 7,
    pin_to_top: true,
    is_muted: true,
};

function sort_groups(query) {
    const streams = stream_data.subscribed_stream_ids();
    return stream_sort.sort_groups(streams, query);
}

function test(label, f) {
    run_test(label, ({override, override_rewire}) => {
        stream_data.clear_subscriptions();
        f({override, override_rewire});
    });
}

test("no_subscribed_streams", () => {
    const sorted = sort_groups("");
    assert.deepEqual(sorted, {
        dormant_streams: [],
        muted_active_streams: [],
        muted_pinned_streams: [],
        normal_streams: [],
        pinned_streams: [],
        same_as_before: sorted.same_as_before,
    });
    assert.equal(stream_sort.first_stream_id(), undefined);
});

test("basics", ({override_rewire}) => {
    stream_data.add_sub(scalene);
    stream_data.add_sub(fast_tortoise);
    stream_data.add_sub(pneumonia);
    stream_data.add_sub(clarinet);
    stream_data.add_sub(weaving);
    stream_data.add_sub(muted_active);
    stream_data.add_sub(muted_pinned);

    override_rewire(stream_data, "is_active", (sub) => sub.name !== "pneumonia");

    // Test sorting into categories/alphabetized
    let sorted = sort_groups("");
    assert.deepEqual(sorted.pinned_streams, [scalene.stream_id]);
    assert.deepEqual(sorted.normal_streams, [clarinet.stream_id, fast_tortoise.stream_id]);
    assert.deepEqual(sorted.muted_pinned_streams, [muted_pinned.stream_id]);
    assert.deepEqual(sorted.muted_active_streams, [muted_active.stream_id]);
    assert.deepEqual(sorted.dormant_streams, [pneumonia.stream_id]);

    // Test cursor helpers.
    assert.equal(stream_sort.first_stream_id(), scalene.stream_id);

    assert.equal(stream_sort.prev_stream_id(scalene.stream_id), undefined);
    assert.equal(stream_sort.prev_stream_id(muted_pinned.stream_id), scalene.stream_id);
    assert.equal(stream_sort.prev_stream_id(clarinet.stream_id), muted_pinned.stream_id);

    assert.equal(stream_sort.next_stream_id(fast_tortoise.stream_id), muted_active.stream_id);
    assert.equal(stream_sort.next_stream_id(muted_active.stream_id), pneumonia.stream_id);
    assert.equal(stream_sort.next_stream_id(pneumonia.stream_id), undefined);

    // Test filtering
    sorted = sort_groups("s");
    assert.deepEqual(sorted.pinned_streams, [scalene.stream_id]);
    assert.deepEqual(sorted.normal_streams, []);
    assert.deepEqual(sorted.dormant_streams, []);

    assert.equal(stream_sort.prev_stream_id(clarinet.stream_id), undefined);

    assert.equal(stream_sort.next_stream_id(clarinet.stream_id), undefined);

    // Test searching entire word, case-insensitive
    sorted = sort_groups("PnEuMoNiA");
    assert.deepEqual(sorted.pinned_streams, []);
    assert.deepEqual(sorted.normal_streams, []);
    assert.deepEqual(sorted.dormant_streams, [pneumonia.stream_id]);

    // Test searching part of word
    sorted = sort_groups("tortoise");
    assert.deepEqual(sorted.pinned_streams, []);
    assert.deepEqual(sorted.normal_streams, [fast_tortoise.stream_id]);
    assert.deepEqual(sorted.dormant_streams, []);

    // Test searching stream with spaces
    sorted = sort_groups("fast t");
    assert.deepEqual(sorted.pinned_streams, []);
    assert.deepEqual(sorted.normal_streams, [fast_tortoise.stream_id]);
    assert.deepEqual(sorted.dormant_streams, []);
});
