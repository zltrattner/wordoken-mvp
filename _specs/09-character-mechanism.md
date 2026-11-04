# 9. Character mechanism

## 9.1 Avatar assembly

| Input | Source |
| --- | --- |
| Fighter appearances | Player and opponent snapshots from 3.3 |
| Selected parts | Item and appearance bindings from 3.9 and 3.10 |
| Sprite frames | Definitive package in the character references below |
| Match events | Accepted words and knockout flags from Section 7 |
| Fighter placement | Center coordinates, scale, and horizontal facing sign |

9.1.1 Load and decode the required atlas images before the countdown.

9.1.2 Keep each fighter's snapshot appearance throughout the match.

9.1.3 Draw each fighter with this procedure, using the frame position from 9.2.4.

```text
procedure draw_fighter(fighter, action, frame_index):
    save_transform()
    translate(fighter.center_x, fighter.center_y)
    scale(fighter.scale * fighter.facing_sign, fighter.scale)

    for part in [Legs, Torso, HeadBack, Skin, Eyes, HeadFront]:
        sequence = fighter.frames[action].get(part)
        if sequence is absent:
            continue
        frame = sequence[frame_index]
        x = frame.spriteSourceSize.x - frame.sourceSize.w / 2
        y = frame.spriteSourceSize.y - frame.sourceSize.h / 2
        draw_region(
            image = atlas_images[frame.fileid],
            source = frame.frame,
            destination = rectangle(x, y, frame.frame.w, frame.frame.h)
        )

    restore_transform()
```

9.1.4 Reuse one decoded image per required atlas across both fighters.

9.1.5 Keep animation frames as metadata referencing the shared atlas images.

9.1.6 Set `facing_sign` to 1 or -1 so the fighters face each other.

## 9.2 Frame playback

9.2.1 Define playback settings in `content/characters/animations.json`.

| Setting | Initial value |
| --- | --- |
| `fps` | 12 for each action, following the prototype |
| `knockout_hold_ms` | 500 |
| `impact_frames` | Ordered frame indexes for each attack, set during sprite preview review |

9.2.2 Treat playback speed, impact markers, and knockout hold as values requiring visual review.

9.2.3 Set each fighter's `frames` with this function once per avatar selection, using normalized keys under 3.10.4.

```text
function build_frame_lookup(selected_bindings, packing, actions):
    lookup = empty_map()
    for action in actions:
        lookup[action] = empty_map()
        for binding in selected_bindings:
            frames = packing.frames_for(
                binding.source_character, action, binding.part, binding.variant
            )
            lookup[action][binding.part] = sort(frames, by numeric_filename_suffix)
    return lookup
```

9.2.4 Calculate the shared frame position and action completion with these functions.

```text
function frame_position(action, action_elapsed_ms, fps, frame_count):
    position = floor(action_elapsed_ms * fps / 1000)
    if action == Idle:
        return position modulo frame_count
    return min(position, frame_count - 1)

function action_finished(action, action_elapsed_ms, fps, frame_count):
    return action != Idle and action_elapsed_ms * fps >= frame_count * 1000
```

9.2.5 Reject asset builds with missing frames, unequal layer counts, invalid impact indexes, or out-of-bounds atlas rectangles.

## 9.3 Attack selection

9.3.1 Choose Punch or Kick with equal probability for each ordinary accepted word.

9.3.2 When a weapon is equipped, use its `attack_action` for accepted Wordokens.

9.3.3 With no weapon equipped, choose the Wordoken's attack under 9.3.1.

9.3.4 Katana equipment leaves word points and knockout chances under Section 7 unchanged.

9.3.5 Invalid and duplicate submissions produce no attack event.

## 9.4 Attacks and reactions

9.4.1 An attack exchange consists of one fighter's attack and the other fighter's reactions.

| Animation state | Initial value |
| --- | --- |
| `active_exchange`, `waiting_attack`, `ending`, `hold_started_at` | null |
| Each fighter's action | Idle |

9.4.2 Schedule accepted-word events with this procedure.

```text
procedure schedule_attack(event):
    if ending is not null:
        return
    if active_exchange is not null:
        waiting_attack = event
    else:
        start_exchange(event)

procedure start_exchange(event):
    action = play(event.attacker, attack_selected_under_9_3(event))
    active_exchange = {attacker_action = action, defender = event.defender, last_frame = -1}
    play(event.defender, Idle)
```

9.4.3 Advance exchanges with this procedure after updating their animation clocks.

```text
procedure advance_exchange():
    if active_exchange is null:
        return
    attack = active_exchange.attacker_action
    for marker in attack.impact_frames where
            active_exchange.last_frame < marker <= attack.current_frame:
        play(active_exchange.defender, reaction_for_impact(active_exchange, marker))
    active_exchange.last_frame = attack.current_frame
    for fighter in [player, opponent]:
        if fighter.action.finished and fighter.action != React2:
            play(fighter, Idle)
    defender = active_exchange.defender
    if attack.finished and (defender.action == Idle or defender.action.finished):
        active_exchange = null
        if waiting_attack is not null:
            next = waiting_attack
            waiting_attack = null
            start_exchange(next)
```

## 9.5 Knockouts and match endings

9.5.1 Present match endings with this procedure after the game is saved under 7.8.4.

```text
procedure present_ending(event):
    active_exchange = null
    waiting_attack = null
    ending = event
    if event.end_reason == timeout:
        open_result_screen()
    else if event.knocked_out == {player, opponent}:
        play(player, React2)
        play(opponent, React2)
    else:
        start_exchange(event.triggering_word)
```

9.5.2 Choose impact reactions with this function.

```text
function reaction_for_impact(exchange, marker):
    if ending is not null and ending.end_reason == knockout and
            marker == last(exchange.attacker_action.impact_frames):
        return React2
    return React1
```

9.5.3 Check the knockout hold on each presentation update with this procedure.

```text
procedure update_knockout_hold(now_ms):
    if ending is null or ending.end_reason != knockout:
        return
    if any(fighter in ending.knocked_out has not finished React2):
        return
    if hold_started_at is null:
        hold_started_at = now_ms
    if now_ms - hold_started_at >= knockout_hold_ms:
        open_result_screen()
```

## 9.6 Returning to the app

9.6.1 After restoring an active game under 7.2.4, discard old animation events and resume from Idle.

9.6.2 Open the result screen directly when the restored game has already ended.

9.6.3 During an active game, retain the last drawable pose on playback failure without blocking word controls.

9.6.4 Open the result screen if knockout playback fails.

Sources: [Character reference inventory](../technical-reference/logic/characters/README.md), [SpriteTest.pde](../technical-reference/logic/characters/SpriteTest/SpriteTest.pde), and [definitive packing JSON](../technical-reference/logic/characters/Sprites/WO_Sprites1_merged.json).

Browser rendering reference: [Canvas source-rectangle drawing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage).
