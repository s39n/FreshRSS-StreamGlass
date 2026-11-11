<?php

declare(strict_types=1);

/**
 * StreamGlass: the StreamRSS (Android) look for FreshRSS.
 *
 * Adds a stylesheet, plus a small script for Youlag's video view. It works on its own, but is built to layer over Youlag,
 * whose design tokens (--yl-*) it re-skins; selectors use extra specificity so the
 * load order between the two extensions doesn't matter.
 */
final class StreamGlassExtension extends Minz_Extension
{
    #[\Override]
    public function init(): void
    {
        Minz_View::appendStyle($this->getFileUrl('streamglass.css'));
        // Playlist "remove" chips and collapsible descriptions in Youlag's video view.
        Minz_View::appendScript($this->getFileUrl('streamglass.js'));
    }
}
