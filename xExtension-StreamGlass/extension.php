<?php

declare(strict_types=1);

/**
 * StreamGlass: the StreamRSS (Android) look for FreshRSS.
 *
 * Only adds a stylesheet. It works on its own, but is built to layer over Youlag,
 * whose design tokens (--yl-*) it re-skins; selectors use extra specificity so the
 * load order between the two extensions doesn't matter.
 */
final class StreamGlassExtension extends Minz_Extension
{
    #[\Override]
    public function init(): void
    {
        Minz_View::appendStyle($this->getFileUrl('streamglass.css'));
    }
}
