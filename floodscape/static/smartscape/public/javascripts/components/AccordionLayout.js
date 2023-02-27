//-------------------------------------------------------------------------------
// DSS.components.AccordionLayout
//
// Allows customising a few elements that the default didn't offer control over
//-------------------------------------------------------------------------------
Ext.define('DSS.components.AccordionLayout', {
    extend: 'Ext.layout.container.Accordion',
    alias: 'layout.DSS_accordion',
    type: 'DSS_accordion',
 
 	allowCollapseAll: true,

    updatePanelClasses: function(ownerContext) {
        var children = ownerContext.visibleItems,
            ln = children.length,
            siblingCollapsed = true,
            i, child, header;
 
        for (i = 0; i < ln; i++) {
            child = children[i];
            header = child.header;
            header.addCls(Ext.baseCSSPrefix + 'accordion-hd');
 
            if (siblingCollapsed) {
                header.removeCls(Ext.baseCSSPrefix + 'accordion-hd-sibling-expanded');
            } else {
                header.addCls(Ext.baseCSSPrefix + 'accordion-hd-sibling-expanded');
            }
 
            if (i + 1 === ln && child.collapsed) {
                header.addCls(Ext.baseCSSPrefix + 'accordion-hd-last-collapsed');
            } else {
                header.removeCls(Ext.baseCSSPrefix + 'accordion-hd-last-collapsed');
            }
 
            siblingCollapsed = child.collapsed;
        }
    },
    
    onBeforeComponentCollapse: function(comp) {
        var me = this,
            owner = me.owner,
            toExpand,
            expanded,
            previousValue;
 
        if (me.owner.items.getCount() === 1) {
            // do not automatically allow collapse if there is only one item 
            return me.allowCollapseAll;
        }
 
        if (!me.processing) {
            me.processing = true;
            previousValue = owner.deferLayouts;
            owner.deferLayouts = true;
            toExpand = comp.next() || comp.prev();
 
            // If we are allowing multi, and the "toCollapse" component is NOT the only expanded Component, 
            // then ask the box layout to collapse it to its header. 
            if (me.multi) {
                expanded = me.getExpanded();
 
                // If the collapsing Panel is the only expanded one, expand the following Component. 
                // All this is handling fill: true, so there must be at least one expanded, 
                if (expanded.length === 1 && !me.allowCollapseAll) {
                    toExpand.expand();
                }
 
            } else if (toExpand) {
                toExpand.expand();
            }
            owner.deferLayouts = previousValue;
            me.processing = false;
        }
    }
 
});
