import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { filter, filterBy, gt } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import LinkComponent from '@ember/routing/link-component';
import layout from 'ember-bootstrap/templates/components/bs-nav/item';
import ComponentParent from 'ember-bootstrap/mixins/component-parent';
import overrideableCP from '../../../utils/overrideable-cp';
import { inject as service } from '@ember/service';
import { isArray } from '@ember/array';

/**

 Component for each item within a [Components.Nav](Components.Nav.html) component. Have a look there for examples.

 @class NavItem
 @namespace Components
 @extends Ember.Component
 @uses Mixins.ComponentParent
 @public
 */
export default Component.extend(ComponentParent, {
  layout,
  classNameBindings: ['disabled', 'active'],
  tagName: 'li',
  router: service(),

  /**
   * If set will wrap the item's content in a link. Accepts either a string with the route name, or an array
   * with the route name and one or multiple models / query params, similar to the positional params of `{{link-to ...}}`
   *
   * @property linkTo
   * @type {string|array}
   * @public
   */
  linkTo: undefined,

  linkToParams: computed('linkTo', function() {
    let params = this.get('linkTo');
    return params ? (isArray(params) ? params : [params]) : undefined;
  }),

  /**
   * Render the nav item as disabled (see [Bootstrap docs](http://getbootstrap.com/components/#nav-disabled-links)).
   * By default it will look at any nested `link-to` components and make itself disabled if there is a disabled link.
   * See the [link-to API](http://emberjs.com/api/classes/Ember.Templates.helpers.html#toc_disabling-the-code-link-to-code-component)
   *
   * @property disabled
   * @type boolean
   * @public
   */
  disabled: overrideableCP('_disabled', function() {
    return this.get('_disabled');
  }),
  _disabled: false,

  /**
   * Render the nav item as active.
   * By default it will look at any nested `link-to` components and make itself active if there is an active link
   * (i.e. the link points to the current route).
   * See the [link-to API](http://emberjs.com/api/classes/Ember.Templates.helpers.html#toc_handling-current-route)
   *
   * @property active
   * @type boolean
   * @public
   */
  active: overrideableCP('_active', 'linkToParams.[]', 'router.currentURL', function() {
    let params = this.get('linkToParams');

    return params ? this.get('router').isActive(...params) : this.get('_active');
  }),
  _active: false,

  /**
   * Collection of all `Ember.LinkComponent`s that are children
   *
   * @property childLinks
   * @private
   */
  childLinks: filter('children', function(view) {
    return view instanceof LinkComponent;
  }),

  activeChildLinks: filterBy('childLinks', 'active'),
  hasActiveChildLinks: gt('activeChildLinks.length', 0),

  disabledChildLinks: filterBy('childLinks', 'disabled'),
  hasDisabledChildLinks: gt('disabledChildLinks.length', 0),

  /**
   * Called when clicking the nav item
   *
   * @event onClick
   * @public
   */
  onClick() {},

  click() {
    this.onClick();
  },

  init() {
    this._super(...arguments);
    this.get('activeChildLinks');
    this.get('disabledChildLinks');
  },

  _observeActive: observer('activeChildLinks.[]', function() {
    scheduleOnce('afterRender', this, this._updateActive);
  }),

  _updateActive() {
    this.set('_active', this.get('hasActiveChildLinks'));
  },

  _observeDisabled: observer('disabledChildLinks.[]', function() {
    scheduleOnce('afterRender', this, this._updateDisabled);
  }),

  _updateDisabled() {
    this.set('_disabled', this.get('hasDisabledChildLinks'));
  }
});
